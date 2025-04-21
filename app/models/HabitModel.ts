import { types } from "mobx-state-tree"

export const HabitModel = types.model("Habit", {
  id: types.identifier,
  emoji: types.string,
  name: types.string,
  time: types.string,
  finished: types.boolean,
  repeatDays: types.array(types.string), 
  dailyTarget: types.number,
  progress: types.optional(types.number, 0),
  lastUpdated: types.optional(types.string, ""), // ISO date
  notificationId: types.maybe(types.string),
})

export type HabitType = typeof HabitModel.Type
