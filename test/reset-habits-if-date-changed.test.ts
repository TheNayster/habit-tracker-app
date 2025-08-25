import { HabitStore } from "../app/models/HabitStore"
import { persistHabitStore } from "../app/models/helpers/persistHabitStore"
import * as storage from "../app/utils/storage"

jest.mock("../app/utils/storage")
jest.mock("uuid", () => ({ v4: () => "test-id" }))
jest.mock("expo-notifications", () => ({
  cancelScheduledNotificationAsync: jest.fn(),
}))

describe("persistHabitStore", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it("resets habit progress when date changes", async () => {
    // Simulate current date
    jest.useFakeTimers().setSystemTime(new Date("2021-01-02"))

    const snapshot = {
      habits: [
        {
          id: "1",
          emoji: "🔥",
          name: "Test",
          time: null,
          finished: false,
          repeatDays: [],
          dailyTarget: 1,
          progress: 1,
          lastUpdated: "2021-01-01",
          notificationIds: [],
        },
      ],
      checkIns: [],
    }

    ;(storage.loadString as jest.Mock).mockResolvedValue(JSON.stringify(snapshot))

    const store = HabitStore.create({ habits: [], checkIns: [] })
    persistHabitStore(store)

    await Promise.resolve()

    const habit = store.habits[0]
    expect(habit.progress).toBe(0)
    expect(habit.lastUpdated).toBe("2021-01-02")
  })
})

