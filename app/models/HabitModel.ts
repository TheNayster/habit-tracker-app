import { types } from "mobx-state-tree"

export const HabitModel = types.model("Habit", {
  id: types.identifier,
  emoji: types.string,
  name: types.string,
  time: types.string,
  finished: types.boolean,
})

export type HabitType = typeof HabitModel.Type
