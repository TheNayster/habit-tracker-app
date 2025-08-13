import { getSnapshot } from "mobx-state-tree"
import * as storage from "../../utils/storage"

jest.mock("../../utils/storage")
jest.mock("uuid", () => ({ v4: () => "test-id" }))
jest.mock("expo-notifications", () => ({
  cancelScheduledNotificationAsync: jest.fn(),
}))

const { HabitStore } = require("../HabitStore")
const { persistHabitStore } = require("./persistHabitStore")

const STORAGE_KEY = "habit-store"

const sampleSnapshot = {
  habits: [],
  checkIns: [],
}

test("handles double encoded snapshot on start and saves on change", async () => {
  ;(storage.loadString as jest.Mock).mockResolvedValue(
    JSON.stringify(JSON.stringify(sampleSnapshot)),
  )
  const saveStringMock = storage.saveString as jest.Mock

  const store = HabitStore.create({ habits: [], checkIns: [] })
  persistHabitStore(store)

  await Promise.resolve()

  expect(getSnapshot(store)).toEqual(sampleSnapshot)

  store.addHabit({
    emoji: "🔥",
    name: "Test",
    time: "10:00",
    finished: false,
    repeatDays: [],
    dailyTarget: 1,
    progress: 0,
    lastUpdated: "",
  })

  const updatedSnapshot = getSnapshot(store)
  expect(saveStringMock).toHaveBeenLastCalledWith(
    STORAGE_KEY,
    JSON.stringify(updatedSnapshot),
  )
})

test("removes habit-store key on parse error", async () => {
  ;(storage.loadString as jest.Mock).mockResolvedValue("not json")
  const removeMock = storage.remove as jest.Mock

  const store = HabitStore.create({ habits: [], checkIns: [] })
  persistHabitStore(store)

  await Promise.resolve()

  expect(removeMock).toHaveBeenCalledWith(STORAGE_KEY)
})
