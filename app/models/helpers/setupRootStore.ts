/**
 * This file is where we do "rehydration" of your RootStore from AsyncStorage.
 * This lets you persist your state between app launches.
 *
 * Navigation state persistence is handled in navigationUtilities.tsx.
 *
 * Note that Fast Refresh doesn't play well with this file, so if you edit this,
 * do a full refresh of your app instead.
 *
 * @refresh reset
 */
import { applySnapshot, IDisposer, onSnapshot } from "mobx-state-tree"
import { RootStore, RootStoreSnapshot, RootStoreModel } from "../RootStore"
import * as storage from "../../utils/storage"

/**
 * The key we'll be saving our state as within async storage.
 */
const ROOT_STATE_STORAGE_KEY = "root-v1"

/**
 * Setup the root state.
 */
let _disposer: IDisposer | undefined
export async function setupRootStore(): Promise<{
  rootStore: RootStore
  restoredState: RootStoreSnapshot | undefined
  unsubscribe: () => void
}> {
  // ✅ Create the store instance with empty habitStore
  const rootStore = RootStoreModel.create({
    habitStore: {
      habits: [],
    },
  })

  let restoredState: RootStoreSnapshot | undefined

  try {
    const snapshot = (await storage.load(ROOT_STATE_STORAGE_KEY)) as RootStoreSnapshot | null
  if (snapshot) {
    applySnapshot(rootStore, snapshot)
    restoredState = snapshot
    }
  } catch (e) {
    if (__DEV__ && e instanceof Error) console.error(e.message)
  }

  // stop tracking state changes if we've already setup
  if (_disposer) _disposer()

  // track changes & save to AsyncStorage
  _disposer = onSnapshot(rootStore, (snapshot) => storage.save(ROOT_STATE_STORAGE_KEY, snapshot))

  const unsubscribe = () => {
    _disposer?.()
    _disposer = undefined
  }

  return { rootStore, restoredState, unsubscribe }
}
