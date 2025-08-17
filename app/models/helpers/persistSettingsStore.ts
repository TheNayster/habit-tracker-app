import { onSnapshot, applySnapshot } from "mobx-state-tree"
import { SettingsStore } from "../SettingsStore"
import * as storage from "../../utils/storage"

const STORAGE_KEY = "settings-store"

export function persistSettingsStore(storeInstance: typeof SettingsStore.Type) {
  storage.loadString(STORAGE_KEY).then((raw) => {
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        applySnapshot(storeInstance, parsed)
      } catch (err) {
        console.error("❌ Error loading settingsStore snapshot", err)
        storage.remove(STORAGE_KEY)
      }
    }
  })

  onSnapshot(storeInstance, (snapshot) => {
    try {
      storage.saveString(STORAGE_KEY, JSON.stringify(snapshot))
    } catch (err) {
      console.error("❌ Error saving settingsStore snapshot", err)
    }
  })
}
