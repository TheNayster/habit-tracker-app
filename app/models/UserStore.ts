import { Instance, SnapshotOut, types } from "mobx-state-tree"
import * as secureStorage from "../utils/secureStorage"

export const UserStore = types
  .model("UserStore", {
    fullName: types.optional(types.string, ""),
    email: types.optional(types.string, ""),
    bio: types.optional(types.string, ""),
    twitter: types.optional(types.string, ""),
    linkedin: types.optional(types.string, ""),
    instagram: types.optional(types.string, ""),
    facebook: types.optional(types.string, ""),
    avatar: types.optional(types.string, ""),
  })
  .actions((self) => ({
    update(infos: Partial<SnapshotOut<typeof UserStore>>) {
      Object.assign(self, infos)
    },
    setAvatar(uri: string) {
      self.avatar = uri
    },
  }))

export interface UserStoreType extends Instance<typeof UserStore> {}
export interface UserStoreSnapshot extends SnapshotOut<typeof UserStore> {}

export async function clearUserData(store: UserStoreType) {
  store.update({
    fullName: "",
    email: "",
    bio: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    avatar: "",
  })
  await secureStorage.remove("user-store")
}
