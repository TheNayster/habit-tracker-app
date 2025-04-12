import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { HabitStore } from "./HabitStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore", {
  habitStore: types.optional(HabitStore, {} as any), // ✅ Allows booting from nothing
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
