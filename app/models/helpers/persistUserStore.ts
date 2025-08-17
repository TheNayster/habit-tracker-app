import { onSnapshot, applySnapshot } from "mobx-state-tree"
import { UserStore } from "../UserStore"
import * as secureStorage from "../../utils/secureStorage"

const STORAGE_KEY = "user-store"

export async function persistUserStore(storeInstance: typeof UserStore.Type) {
  const raw = await secureStorage.loadString(STORAGE_KEY)
  if (raw) {
    try {
      const snapshot = JSON.parse(raw)
      applySnapshot(storeInstance, snapshot)
    } catch (err) {
      console.error("❌ Error loading userStore snapshot", err)
      secureStorage.remove(STORAGE_KEY)
    }
  }

  onSnapshot(storeInstance, (snapshot) => {
    secureStorage
      .saveString(STORAGE_KEY, JSON.stringify(snapshot))
      .catch((err) => console.error("❌ Error saving userStore snapshot", err))
  })
}
