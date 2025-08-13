const today = new Date().toLocaleDateString("en-US", { weekday: "short" })

const habitStore = {
  habits: [
    {
      id: "1",
      emoji: "💪",
      name: "Exercise",
      time: null,
      finished: false,
      repeatDays: [today],
      dailyTarget: 1,
      progress: 0,
      lastUpdated: "",
      notificationIds: [],
    },
  ],
}

describe("unscheduled habit", () => {
  it("persists with null time in store", () => {
    expect(habitStore.habits[0].time).toBeNull()
  })

  it("computes unscheduled display text", () => {
    const habit = habitStore.habits[0]
    const display = habit.time ? `Start at ${habit.time}` : "Unscheduled"
    expect(display).toBe("Unscheduled")
  })
})
