import * as Notifications from "expo-notifications"
import { HabitStore } from "../app/models/HabitStore"

jest.mock("expo-notifications", () => ({
  cancelScheduledNotificationAsync: jest.fn(),
}))
jest.mock("uuid", () => ({ v4: jest.fn() }))

describe("HabitStore.updateHabit", () => {
  it("clamps progress when dailyTarget decreases", () => {
    const habitStore = HabitStore.create({
      habits: [
        {
          id: "1",
          emoji: "🔥",
          name: "Test",
          time: null,
          finished: false,
          repeatDays: [],
          dailyTarget: 10,
          progress: 10,
          lastUpdated: "2021-01-01",
          notificationIds: [],
        },
      ],
    })

    habitStore.updateHabit({
      id: "1",
      name: "Test",
      emoji: "🔥",
      time: null,
      repeatDays: [],
      dailyTarget: 5,
    })

    const habit = habitStore.habits[0]
    expect(habit.dailyTarget).toBe(5)
    expect(habit.progress).toBe(5)
  })
})
