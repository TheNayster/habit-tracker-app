import { onSnapshot, applySnapshot } from "mobx-state-tree"
import { HabitStore } from "../HabitStore"
import * as storage from "../../utils/storage"

const STORAGE_KEY = "habit-store"

export function persistHabitStore(storeInstance: typeof HabitStore.Type) {
  storage.loadString(STORAGE_KEY).then((raw) => {
    if (raw) {
      try {
        const snapshot = typeof raw === "string" ? JSON.parse(raw) : raw
        const parsed = typeof snapshot === "string" ? JSON.parse(snapshot) : snapshot
        applySnapshot(storeInstance, parsed)
      } catch (err) {
        console.error("❌ Error loading habitStore snapshot", err)
        storage.remove(STORAGE_KEY)
      }
    } else {
      console.warn("⚠️ No saved habitStore snapshot found.")
    }

    // Ensure daily progress does not carry over to a new day
    storeInstance.resetHabitsIfDateChanged()
  })

  onSnapshot(storeInstance, (snapshot) => {
    try {
      storage.saveString(STORAGE_KEY, JSON.stringify(snapshot))
    } catch (err) {
      console.error("❌ Error saving habitStore snapshot", err)
    }
  })
}
