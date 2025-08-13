import * as Notifications from "expo-notifications"

import { HabitStore } from "../app/models/HabitStore"

jest.mock("expo-notifications", () => ({
  cancelScheduledNotificationAsync: jest.fn(),
}))
jest.mock("uuid", () => ({ v4: jest.fn() }))

describe("HabitStore.deleteHabit", () => {
  it("logs when cancelScheduledNotificationAsync fails", async () => {
    const habitStore = HabitStore.create({
      habits: [
        {
          id: "1",
          emoji: "🔥",
          name: "Test",
          time: "2021-01-01T00:00:00.000Z",
          finished: false,
          repeatDays: [],
          dailyTarget: 1,
          notificationIds: ["n1"],
        },
      ],
    })

    const error = new Error("fail")
    ;(Notifications.cancelScheduledNotificationAsync as jest.Mock).mockRejectedValue(error)
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined)

    await habitStore.deleteHabit("1")

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith("n1")
    expect(errorSpy).toHaveBeenCalled()
    expect(habitStore.habits.length).toBe(0)

    errorSpy.mockRestore()
  })
})

