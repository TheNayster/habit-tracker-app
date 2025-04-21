import { onSnapshot, applySnapshot } from "mobx-state-tree"
import { HabitStore } from "../HabitStore"
//import { storage } from "../../utils/storage/mmkv"
import * as storage from "../../utils/storage"

const STORAGE_KEY = "habit-store"

export function persistHabitStore(storeInstance: typeof HabitStore.Type) {
  /*const saved = storage.getString(STORAGE_KEY)
  if (saved) {
    try {
      applySnapshot(storeInstance, JSON.parse(saved))
    } catch (err) {
      console.error("❌ Error loading habitStore snapshot", err)
    }
  }

  onSnapshot(storeInstance, (snapshot) => {
    try {
      storage.set(STORAGE_KEY, JSON.stringify(snapshot))
    } catch (err) {
      console.error("❌ Error saving habitStore snapshot", err)
    }
  })
    */
  storage.load(STORAGE_KEY).then((saved) => {
    if (typeof saved === "string") {
      try {
        applySnapshot(storeInstance, JSON.parse(saved))
      } catch (err) {
        console.error("❌ Error loading habitStore snapshot", err)
      }
    } else {
      console.warn("⚠️ No saved habitStore snapshot found or not a string.")
    }
  })  
  
  onSnapshot(storeInstance, (snapshot) => {
    try {
      storage.save(STORAGE_KEY, JSON.stringify(snapshot))
    } catch (err) {
      console.error("❌ Error saving habitStore snapshot", err)
    }
  })
  
}