import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet } from "react-native"
import { observer } from "mobx-react-lite"
import { DateData } from "react-native-calendars"
import { useStores } from "app/models"
import { Screen } from "app/components"
import { spacing, colors } from "app/theme"
import { Calendar } from "react-native-calendars"

export const CalendarScreen = observer(function CalendarScreen() {
  const { habitStore } = useStores()
  const [selectedDay, setSelectedDay] = useState("")
  const [habitsForDay, setHabitsForDay] = useState<string[]>([])

  // Generate next 180 days with weekday abbreviation
  const generateDates = () => {
    const map: Record<string, string> = {}
    const today = new Date()
    for (let i = 0; i < 180; i++) {
      const future = new Date(today)
      future.setDate(today.getDate() + i)
      const iso = future.toISOString().split("T")[0]
      const day = future.toLocaleDateString("en-US", { weekday: "short" }) // Mon, Tue, etc.
      map[iso] = day
    }
    return map
  }

  const weekdayMap = generateDates()

  // Create marked dates
  const markedDates = Object.keys(weekdayMap).reduce((acc, date) => {
    const weekday = weekdayMap[date]
    const shouldMark = habitStore.habits.some((habit) => habit.repeatDays.includes(weekday))
    if (shouldMark) {
      acc[date] = {
        marked: true,
        dotColor: colors.palette.primary400,
        selected: date === selectedDay,
        selectedColor: colors.palette.primary200,
      }
    }
    return acc
  }, {} as Record<string, any>)

  const handleDayPress = (day: DateData) => {
    setSelectedDay(day.dateString)
    const weekday = weekdayMap[day.dateString]
    const habits = habitStore.habits
      .filter((habit) => habit.repeatDays.includes(weekday))
      .map((h) => h.name)
    setHabitsForDay(habits)
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        style={$calendar}
        theme={{
          selectedDayBackgroundColor: colors.palette.primary300,
          todayTextColor: colors.palette.primary600,
        }}
      />
      <View style={$habitList}>
        <Text style={styles.heading}>Habits for {selectedDay || "..."}</Text>
        {habitsForDay.length > 0 ? (
          habitsForDay.map((habit, idx) => (
            <Text key={idx} style={styles.habit}>
              {habit}
            </Text>
          ))
        ) : (
          <Text style={styles.noHabits}>No habits for this day</Text>
        )}
      </View>
    </Screen>
  )
})

const $container = {
  padding: spacing.md,
}

const $calendar = {
  borderRadius: 10,
  overflow: "hidden",
  marginBottom: spacing.lg,
}

const $habitList = {
  gap: 12,
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.text,
  },
  habit: {
    fontSize: 14,
    paddingVertical: 4,
    color: colors.text,
  },
  noHabits: {
    fontSize: 14,
    fontStyle: "italic",
    color: colors.textDim,
  },
})
