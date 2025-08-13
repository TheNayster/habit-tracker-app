import { types, SnapshotIn, flow } from "mobx-state-tree"
import { HabitModel } from "./HabitModel"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { v4 as uuidv4 } from "uuid"
import { format, subDays } from "date-fns"
import * as Notifications from "expo-notifications"

const CheckInModel = types
  .model("CheckIn", {
    id: types.identifier,
    emoji: types.string,
    title: types.string,
    unit: types.string,
    color: types.string,
    current: types.number,
    goal: types.number,
  })
  .views((self) => ({
    get amount(): string {
      return `${self.current}/${self.goal}`
    },
    get fill(): number {
      return Math.min(100, Math.round((self.current / self.goal) * 100))
    },
  }))
  .actions((self) => ({
    increment(): void {
      if (self.current < self.goal) self.current += 1
    },
    decrement(): void {
      if (self.current > 0) self.current -= 1
    },
  }))

export const HabitStore = types
  .model("HabitStore", {
    habits: types.array(HabitModel),
    checkIns: types.optional(types.array(CheckInModel), []),
  })
  .views((store) => ({
    get days(): { day: string; date: string; progress: number }[] {
      const today = new Date()
      return Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(today, 6 - i)
        return {
          day: format(date, "EEE"),
          date: format(date, "d"),
          progress: 0,
        }
      })
    },
  }))
  .actions(withSetPropAction)
  .actions((store) => ({
    addHabit(
      habitData: Omit<SnapshotIn<typeof HabitModel>, "id" | "notificationIds" | "time"> & {
        time?: string | null
        notificationIds?: string[]
      },
    ): void {
      const newHabit = {
        ...habitData,
        time: habitData.time ?? null,
        id: uuidv4(),
        notificationIds: habitData.notificationIds ?? [],
      }
      store.habits.push(newHabit)
    },
    toggleHabit(id: string): void {
      const habit = store.habits.find((h) => h.id === id)
      if (habit) habit.finished = !habit.finished
    },
    removeHabit(id: string): void {
      store.habits.replace(store.habits.filter((h) => h.id !== id))
    },
    addCheckIn(data: Omit<SnapshotIn<typeof CheckInModel>, "id" | "current">): void {
      const newCheckIn = {
        ...data,
        id: uuidv4(),
        current: 0,
      }
      store.checkIns.push(newCheckIn)
    },
    removeCheckIn(id: string): void {
      store.checkIns.replace(store.checkIns.filter((c) => c.id !== id))
    },
    resetHabitsIfDateChanged(): void {
      const today = new Date().toISOString().split("T")[0]
      store.habits.forEach((habit) => {
        if (habit.lastUpdated !== today) {
          habit.progress = 0
          habit.lastUpdated = today
        }
      })
    },
    incrementHabit(id: string): void {
      const habit = store.habits.find((h) => h.id === id)
      if (habit && habit.progress < habit.dailyTarget) {
        habit.progress += 1
        habit.lastUpdated = new Date().toISOString().split("T")[0]
      }
    },
    decrementHabit(id: string): void {
      const habit = store.habits.find((h) => h.id === id)
      if (habit && habit.progress > 0) {
        habit.progress -= 1
        habit.lastUpdated = new Date().toISOString().split("T")[0]
      }
    },
    updateHabit(updatedHabit: {
      id: string
      name: string
      emoji: string
      time: string | null
      repeatDays: string[]
      dailyTarget: number
      notificationIds?: string[]
    }): void {
      const habit = store.habits.find((h) => h.id === updatedHabit.id)
      if (!habit) return

      habit.name = updatedHabit.name
      habit.emoji = updatedHabit.emoji
      habit.time = updatedHabit.time
      habit.repeatDays.replace(updatedHabit.repeatDays)
      habit.dailyTarget = updatedHabit.dailyTarget

      if (habit.progress > habit.dailyTarget) {
        habit.progress = habit.dailyTarget
      }

      if (updatedHabit.notificationIds) {
        habit.notificationIds.replace(updatedHabit.notificationIds)
      }

      habit.lastUpdated = new Date().toISOString() // optional force-trigger reactivity
    },

    deleteHabit: flow(function* deleteHabit(id: string) {
      const habit = store.habits.find((h) => h.id === id)
      if (habit) {
        for (const notifId of habit.notificationIds) {
          try {
            yield Notifications.cancelScheduledNotificationAsync(notifId)
          } catch (error) {
            console.error(`Failed to cancel notification ${notifId}`, error)
          }
        }
      }
      store.habits.replace(store.habits.filter((h) => h.id !== id))
    }),
  }))
