import { createContext, useContext, useEffect, useState } from "react"
import { RootStore, RootStoreModel } from "../RootStore"
import { setupRootStore } from "./setupRootStore"

// 🔧 Create an empty model initially (safe for static context init)
const _rootStore = RootStoreModel.create({
  habitStore: {
    habits: [],
    checkIns: [],
  },
  userStore: {},
})

// ✅ Shared context for app-wide store access
const RootStoreContext = createContext<RootStore>(_rootStore)

export const RootStoreProvider = RootStoreContext.Provider

export const useStores = () => useContext(RootStoreContext)

export const useInitialRootStore = (callback?: () => void | Promise<void>) => {
  const rootStore = useStores()
  const [rehydrated, setRehydrated] = useState(false)

  useEffect(() => {
    ;(async () => {
      await setupRootStore() // no longer needs unsubscribe
      if (__DEV__) {
        console.tron.trackMstNode?.(rootStore)
      }

      setRehydrated(true)
      if (callback) await callback()
    })()
  }, [])

  return { rootStore, rehydrated }
}
