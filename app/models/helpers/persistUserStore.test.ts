import { getSnapshot } from "mobx-state-tree"

jest.mock("../../utils/secureStorage", () => ({
  loadString: jest.fn().mockResolvedValue(null),
  saveString: jest.fn().mockResolvedValue(true),
  remove: jest.fn().mockResolvedValue(undefined),
}))

const secureStorage = require("../../utils/secureStorage") as jest.Mocked<
  typeof import("../../utils/secureStorage")
>
const { UserStore } = require("../UserStore")
const { persistUserStore } = require("./persistUserStore")

const STORAGE_KEY = "user-store"

const sampleSnapshot = {
  fullName: "Test User",
  email: "test@example.com",
  bio: "",
  twitter: "",
  linkedin: "",
  instagram: "",
  facebook: "",
  avatar: "",
}

test("loads snapshot on start and saves on change", async () => {
  ;(secureStorage.loadString as jest.Mock).mockResolvedValue(
    JSON.stringify(sampleSnapshot),
  )
  const saveStringMock = secureStorage.saveString as jest.Mock

  const store = UserStore.create({})
  await persistUserStore(store)

  expect(getSnapshot(store)).toEqual(sampleSnapshot)

  store.update({ fullName: "Another User" })
  const updatedSnapshot = getSnapshot(store)
  expect(saveStringMock).toHaveBeenLastCalledWith(
    STORAGE_KEY,
    JSON.stringify(updatedSnapshot),
  )
})

test("removes user-store key on parse error", async () => {
  ;(secureStorage.loadString as jest.Mock).mockResolvedValue("not json")
  const removeMock = secureStorage.remove as jest.Mock

  const store = UserStore.create({})
  await persistUserStore(store)

  expect(removeMock).toHaveBeenCalledWith(STORAGE_KEY)
})

