import { onSnapshot, applySnapshot } from "mobx-state-tree"
import { HabitStore } from "../HabitStore"
import * as storage from "../../utils/storage"

const STORAGE_KEY = "habit-store"

export function persistHabitStore(storeInstance: typeof HabitStore.Type) {
  storage.loadString(STORAGE_KEY).then((saved) => {
    if (saved) {
      try {
        applySnapshot(storeInstance, JSON.parse(saved))
      } catch (err) {
        console.error("❌ Error loading habitStore snapshot", err)
      }
    } else {
      console.warn("⚠️ No saved habitStore snapshot found.")
    }
  })

  onSnapshot(storeInstance, (snapshot) => {
    try {
      storage.saveString(STORAGE_KEY, JSON.stringify(snapshot))
    } catch (err) {
      console.error("❌ Error saving habitStore snapshot", err)
    }
  })
}