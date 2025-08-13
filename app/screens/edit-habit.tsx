
import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import {
  Platform,
  FlatList,
  Pressable,
  TouchableOpacity,
} from "react-native"
import { Screen, Text, TextField } from "app/components"
import { spacing, colors } from "app/theme"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useStores } from "app/models"
import DateTimePicker from "@react-native-community/datetimepicker"
import Toast from "react-native-toast-message"
import * as Notifications from "expo-notifications"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { HomeStackScreenProps } from "app/navigators/types"

export const EditHabitScreen = observer(function EditHabitScreen() {
  const { habitStore } = useStores()
  const navigation = useNavigation<HomeStackScreenProps<"EditHabit">["navigation"]>()
  const route = useRoute<HomeStackScreenProps<"EditHabit">["route"]>()
  const { habitId } = route.params as unknown as { habitId: string }

  const habit = habitStore.habits.find((h) => h.id === habitId)

  console.log("🛠 Editing Habit ID:", habitId, "| Habit Found:", !!habit)

  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("")
  const [time, setTime] = useState<Date | null>(null)
  const [repeatDays, setRepeatDays] = useState<string[]>([])
  const [showTimePicker, setShowTimePicker] = useState(false)

  useEffect(() => {
    if (!habit) return
    setName(habit.name)
    setEmoji(habit.emoji)
    setTime(habit.time ? new Date(habit.time) : null)
    setRepeatDays(habit.repeatDays.slice())
  }, [habit])

  const updateHabit = async () => {
    if (!habit || !name || repeatDays.length === 0) {
      Toast.show({ type: "error", text1: "Please fill all required fields" })
      return
    }

    if (time) {
      const triggerTime = new Date(time)
      const now = new Date()
      if (triggerTime <= now) triggerTime.setDate(triggerTime.getDate() + 1)

      const newNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Reminder: ${name}`,
          body: `Time to complete your habit!`,
        },
        trigger: {
          type: "calendar",
          hour: triggerTime.getHours(),
          minute: triggerTime.getMinutes(),
          repeats: true,
        } as unknown as Notifications.NotificationTriggerInput,
      })

      console.log("✅ Updating Habit:", habit.id)

      habitStore.updateHabit({
        id: habit.id,
        name,
        emoji,
        time: triggerTime.toISOString(),
        repeatDays,
        notificationIds: [newNotificationId],
      })
    } else {
      habitStore.updateHabit({
        id: habit.id,
        name,
        emoji,
        time: null,
        repeatDays,
        notificationIds: [],
      })
    }

    Toast.show({ type: "success", text1: `Updated: ${name}` })
    navigation.goBack()
  }

  const deleteHabit = async () => {
    if (!habit) return
    if (habit.notificationIds) {
      for (const id of habit.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id)
      }
    }
    habitStore.deleteHabit(habit.id)
    Toast.show({ type: "info", text1: `Deleted: ${habit.name}` })
    navigation.goBack()
  }

  const toggleRepeatDay = (day: string) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginBottom: spacing.md }}
      >
        <MaterialCommunityIcons name="chevron-left" size={28} color={colors.tint} />
      </TouchableOpacity>

      <Text preset="heading" text="Edit Habit" style={{ marginBottom: spacing.md }} />

      <TextField
        label="Habit Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: spacing.md }}
      />

      <TextField
        label="Emoji"
        value={emoji}
        onChangeText={setEmoji}
        style={{ marginBottom: spacing.md }}
      />

      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ marginBottom: spacing.md }}>
        <Text
          text={`Time: ${time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Unscheduled"}`}
          style={{ fontSize: 16 }}
        />
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={time ?? new Date()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false)
            if (selectedTime) setTime(selectedTime)
          }}
        />
      )}

      <Text text="Repeat Days:" style={{ marginBottom: spacing.sm }} />
      <FlatList
        data={allDays}
        keyExtractor={(item) => item}
        horizontal
        renderItem={({ item }) => (
          <Pressable onPress={() => toggleRepeatDay(item)}>
            <Text
              text={item}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 9,
                margin: 4,
                borderRadius: 4,
                fontSize: 14,
                backgroundColor: repeatDays.includes(item)
                  ? colors.palette.primary300
                  : colors.palette.neutral300,
              }}
            />
          </Pressable>
        )}
      />

      <TouchableOpacity
        onPress={updateHabit}
        style={{
          backgroundColor: colors.palette.primary600,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          borderRadius: 8,
          marginTop: spacing.xl,
          alignItems: "center",
        }}
      >
        <Text text="Save Changes" style={{ fontSize: 16, color: "white", fontWeight: "bold" }} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={deleteHabit}
        style={{
          marginTop: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: 8,
          backgroundColor: colors.error,
          alignItems: "center",
        }}
      >
        <Text text="Delete Habit" style={{ fontSize: 16, color: "white", fontWeight: "bold" }} />
      </TouchableOpacity>
    </Screen>
  )
})
