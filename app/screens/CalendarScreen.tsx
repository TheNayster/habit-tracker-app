
import React, { useState, useMemo } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Calendar } from "react-native-calendars"
import { observer } from "mobx-react-lite"
import { useStores } from "app/models"
import { Screen } from "app/components"
import { colors, spacing } from "app/theme"

// Utility to get all date strings for the next 30 days matching a repeatDay like "Mon"
function generateHabitDates(repeatDays: string[]): string[] {
  const result: string[] = []
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }

  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const temp = new Date(today)
    temp.setDate(today.getDate() + i)
    const dayName = temp.toLocaleDateString("en-US", { weekday: "short" }) // "Mon", "Tue"
    if (repeatDays.includes(dayName)) {
      result.push(temp.toISOString().split("T")[0])
    }
  }

  return result
}

export const CalendarScreen = observer(function CalendarScreen() {
  const { habitStore } = useStores()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  // Create a map of marked dates based on habit repeatDays
  const markedDates = useMemo(() => {
    const markings: Record<string, any> = {}

    habitStore.habits.forEach(habit => {
      const dates = generateHabitDates(habit.repeatDays || [])
      dates.forEach(d => {
        if (!markings[d]) {
          markings[d] = {
            marked: true,
            dots: [{ color: colors.palette.primary500 }],
          }
        }
      })
    })

    // Always highlight the selected day
    markings[selectedDate] = {
      ...(markings[selectedDate] || {}),
      selected: true,
      selectedColor: colors.palette.primary500,
    }

    return markings
  }, [habitStore.habits.slice(), selectedDate])

  const habitsOnSelectedDate = useMemo(() => {
    const weekday = new Date(selectedDate).toLocaleDateString("en-US", { weekday: "short" })
    return habitStore.habits.filter(h => h.repeatDays?.includes(weekday))
  }, [selectedDate, habitStore.habits.slice()])

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Habit Calendar</Text>
      <Calendar
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: colors.palette.primary500,
          todayTextColor: colors.palette.primary500,
          arrowColor: colors.palette.primary500,
        }}
      />

      <Text style={styles.subheading}>Habits for {selectedDate}</Text>
      {habitsOnSelectedDate.length > 0 ? (
        habitsOnSelectedDate.map((habit, index) => (
          <View key={habit.id || index} style={styles.habitBox}>
            <Text style={styles.habitText}>{habit.emoji} {habit.name}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noHabits}>No habits for this day.</Text>
      )}
    </Screen>
  )
})

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: spacing.lg,
  },
  subheading: {
    fontSize: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  habitBox: {
    backgroundColor: colors.palette.neutral100,
    padding: spacing.sm,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
  },
  habitText: {
    fontSize: 16,
  },
  noHabits: {
    color: colors.textDim,
    fontSize: 14,
  },
})
