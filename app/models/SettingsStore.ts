import { types } from "mobx-state-tree"

export const SettingsStoreModel = types
  .model("SettingsStore", {
    /** Controls whether the application uses the dark color scheme */
    isDarkMode: types.optional(types.boolean, false),
  })
  .actions((store) => ({
    /** Enable or disable dark mode */
    setDarkMode(value: boolean) {
      store.isDarkMode = value
    },
    /** Convenience toggle */
    toggleDarkMode() {
      store.isDarkMode = !store.isDarkMode
    },
  }))

export const SettingsStore = SettingsStoreModel
export type SettingsStoreType = typeof SettingsStore.Type
