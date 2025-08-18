import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View, TouchableOpacity, Modal, TextInput, Platform, Pressable, Alert } from "react-native"
import { Screen, Text } from "app/components"
import { spacing, colors } from "app/theme"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useStores } from "app/models"
import DateTimePicker from "@react-native-community/datetimepicker"
import Toast from "react-native-toast-message"
import * as Notifications from "expo-notifications"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import EmojiPicker from "rn-emoji-keyboard"
import { HomeStackScreenProps } from "app/navigators/types"

export const EditHabitScreen = observer(function EditHabitScreen() {
  const { habitStore } = useStores()
  const navigation = useNavigation<HomeStackScreenProps<"EditHabit">["navigation"]>()
  const route = useRoute<HomeStackScreenProps<"EditHabit">["route"]>()
  const { habitId } = route.params as { habitId: string }

  const habit = habitStore.habits.find((h) => h.id === habitId)

  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("💪")
  const [repeatDays, setRepeatDays] = useState<string[]>([])
  const [dailyTarget, setDailyTarget] = useState("1")
  const [time, setTime] = useState<Date | null>(null)
  const [tempTime, setTempTime] = useState(new Date())
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  useEffect(() => {
    if (!habit) return
    setName(habit.name)
    setEmoji(habit.emoji)
    setRepeatDays(habit.repeatDays.slice())
    setDailyTarget(habit.dailyTarget.toString())
    setTime(habit.time ? parseTimeString(habit.time) : null)
  }, [habit])

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  function parseTimeString(str: string): Date {
    const date = new Date()
    const parts = str.split(" ")
    const timePart = parts[0]
    const modifier = parts[1]
    const [hStr, mStr] = timePart.split(":")
    let hours = parseInt(hStr, 10)
    const minutes = parseInt(mStr, 10)
    if (modifier) {
      const mod = modifier.toLowerCase()
      if (mod === "pm" && hours < 12) hours += 12
      if (mod === "am" && hours === 12) hours = 0
    }
    date.setHours(hours)
    date.setMinutes(minutes)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date
  }

  const toggleRepeatDay = (day: string) => {
    setRepeatDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const updateHabit = async () => {
    if (!habit || !name || repeatDays.length === 0) {
      Toast.show({ type: "error", text1: "Please fill all required fields" })
      return
    }

    if (habit.notificationIds) {
      for (const id of habit.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id)
      }
    }

    const notificationIds: string[] = []

    if (time) {
      const triggerTime = new Date(time)
      const now = new Date()
      if (triggerTime <= now) triggerTime.setDate(triggerTime.getDate() + 1)

      const id = await Notifications.scheduleNotificationAsync({
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
      notificationIds.push(id)
    }

    habitStore.updateHabit({
      id: habit.id,
      name,
      emoji,
      time: time ? formatTime(time) : null,
      repeatDays,
      dailyTarget: parseInt(dailyTarget) || 1,
      notificationIds,
    })

    Toast.show({ type: "success", text1: `Updated: ${name}` })
    navigation.goBack()
  }

  const confirmDeleteHabit = () => {
    if (!habit) return
    Alert.alert("Delete Habit", `Are you sure you want to delete "${habit.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await habitStore.deleteHabit(habit.id)
          Toast.show({ type: "info", text1: `Deleted: ${habit.name}` })
          navigation.goBack()
        },
      },
    ])
  }

  const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={{ padding: spacing.lg }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: spacing.md }}>
        <MaterialCommunityIcons name="chevron-left" size={28} color={colors.tint} />
      </TouchableOpacity>

      <Text preset="heading" text="Edit Habit" style={{ marginBottom: spacing.md }} />

      <Text text="Habit Name:" style={{ fontSize: 20, fontWeight: "bold" }} />
      <TextInput
        placeholder="Type here…"
        placeholderTextColor={colors.textDim}
        value={name}
        onChangeText={setName}
        maxLength={50}
        style={{
          backgroundColor: colors.background,
          padding: spacing.sm,
          marginBottom: spacing.md,
          borderRadius: 10,
          color: colors.text,
        }}
      />

      <TouchableOpacity
        onPress={() => setShowEmojiPicker(true)}
        style={{
          backgroundColor: colors.palette.neutral200,
          borderRadius: 10,
          marginBottom: spacing.md,
          padding: spacing.sm,
        }}
      >
        <Text text={`Select Emoji: ${emoji} Tap to change`} size="xl" />
      </TouchableOpacity>
      <EmojiPicker
        onEmojiSelected={(e) => {
          setEmoji(e.emoji)
          setShowEmojiPicker(false)
        }}
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
      />

      <TouchableOpacity
        onPress={() => {
          setTempTime(time ?? new Date())
          setShowTimeModal(true)
        }}
        style={{
          marginBottom: spacing.md,
          backgroundColor: colors.palette.neutral200,
          padding: spacing.sm,
          borderRadius: 10,
        }}
      >
        <Text
          text={`Time: ${time ? formatTime(time) : "Unscheduled"}`}
          style={{ color: colors.text }}
        />
      </TouchableOpacity>

      <Modal visible={showTimeModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#1e1e1e",
              borderRadius: 10,
              padding: spacing.md,
              width: "80%",
              alignItems: "center",
            }}
          >
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => selectedDate && setTempTime(selectedDate)}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: spacing.md,
                width: "100%",
              }}
            >
              <Pressable
                onPress={() => setShowTimeModal(false)}
                style={{ flex: 1, alignItems: "center" }}
              >
                <Text text="Cancel" style={{ color: colors.palette.primary500 }} />
              </Pressable>
              <Pressable
                onPress={() => {
                  setTime(tempTime)
                  setShowTimeModal(false)
                }}
                style={{ flex: 1, alignItems: "center" }}
              >
                <Text text="OK" style={{ color: colors.palette.primary500 }} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Text text="Repeat Days:" style={{ marginBottom: spacing.sm }} />
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}
      >
        {allDays.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => toggleRepeatDay(day)}
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              backgroundColor: repeatDays.includes(day)
                ? colors.palette.primary400
                : colors.palette.neutral200,
              borderRadius: 10,
            }}
          >
            <Text text={day} style={{ color: colors.text }} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ marginBottom: spacing.lg, alignSelf: "flex-start" }}>
        <Text text="How many times per day?" />
        <TextInput
          value={dailyTarget}
          onChangeText={(text) => {
            const numeric = text.replace(/[^0-9]/g, "")
            if (numeric === "") {
              setDailyTarget("")
              return
            }
            const clamped = Math.max(1, Math.min(99, parseInt(numeric)))
            setDailyTarget(clamped.toString())
          }}
          keyboardType="numeric"
          maxLength={2}
          placeholder="e.g. 1"
          style={{
            width: 80,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            marginTop: spacing.xs,
            color: colors.text,
            textAlign: "center",
          }}
        />
      </View>

      <TouchableOpacity
        onPress={updateHabit}
        style={{
          backgroundColor: colors.palette.primary600,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          borderRadius: 8,
          alignItems: "center",
          marginTop: spacing.xl,
        }}
      >
        <Text text="Save Changes" style={{ fontSize: 16, color: "white", fontWeight: "bold" }} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={confirmDeleteHabit}
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
