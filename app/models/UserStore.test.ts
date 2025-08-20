import { getSnapshot } from "mobx-state-tree"

jest.mock("../utils/secureStorage", () => ({
  remove: jest.fn().mockResolvedValue(undefined),
}))

const secureStorage = require("../utils/secureStorage") as jest.Mocked<
  typeof import("../utils/secureStorage")
>
const { UserStore, clearUserData } = require("./UserStore")

const emptySnapshot = {
  fullName: "",
  email: "",
  bio: "",
  twitter: "",
  linkedin: "",
  instagram: "",
  facebook: "",
  avatar: "",
}

test("clearUserData resets store and removes secure storage", async () => {
  const store = UserStore.create({
    fullName: "Test",
    email: "test@example.com",
    bio: "bio",
    twitter: "t",
    linkedin: "l",
    instagram: "i",
    facebook: "f",
    avatar: "a",
  })

  await clearUserData(store)

  expect(getSnapshot(store)).toEqual(emptySnapshot)
  expect(secureStorage.remove).toHaveBeenCalledWith("user-store")
})
