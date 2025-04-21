/**
 * @refresh reset
 */
import { applySnapshot } from "mobx-state-tree"
import { RootStore, RootStoreSnapshot, RootStoreModel } from "../RootStore"
//import { storage } from "../../utils/storage/mmkv"
import * as storage from "../../utils/storage"
import { persistHabitStore } from "./persistHabitStore"
import { syncNotifications } from "app/utils/syncNotifications"

const ROOT_STATE_STORAGE_KEY = "root-v1"

let _rootStore: RootStore

export async function setupRootStore(): Promise<{
  rootStore: RootStore
  restoredState: RootStoreSnapshot | undefined
}> {
  _rootStore = RootStoreModel.create({
    habitStore: {
      habits: [],
      checkIns: [],
    },
  })

  let restoredState: RootStoreSnapshot | undefined

  try {
    /*const raw = storage.getString(ROOT_STATE_STORAGE_KEY)
    if (raw) {
      const snapshot = JSON.parse(raw)
      applySnapshot(_rootStore, snapshot)
      restoredState = snapshot*/

      const snapshot = (await storage.load(ROOT_STATE_STORAGE_KEY)) as RootStoreSnapshot | null
      if (snapshot) {
        applySnapshot(_rootStore, snapshot)
        restoredState = snapshot
      }
  } catch (err) {
    if (__DEV__ && err instanceof Error) console.error("❌ Rehydration error:", err.message)
  }

  // 🚀 Start syncing and persisting just the habitStore
  persistHabitStore(_rootStore.habitStore)
  syncNotifications(_rootStore.habitStore)

  return { rootStore: _rootStore, restoredState }
}
