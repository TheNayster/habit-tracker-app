// 🔥 CLEANED + FIXED create-habit.tsx FILE

import React, { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View, TouchableOpacity, Modal, TextInput, Platform, Pressable, Switch } from "react-native"
import { Screen, Text } from "app/components"
import { spacing, colors } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { HomeStackScreenProps } from "app/navigators/types"
import DateTimePicker from "@react-native-community/datetimepicker"
import Toast from "react-native-toast-message"
import * as Notifications from "expo-notifications"
import EmojiPicker from "rn-emoji-keyboard"

export const CreateHabitScreen = observer(function CreateHabitScreen() {
  const { habitStore } = useStores()
  const navigation = useNavigation<HomeStackScreenProps<"CreateHabit">["navigation"]>()

  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("💪")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [tempTime, setTempTime] = useState(new Date())
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [repeatDays, setRepeatDays] = useState<string[]>([])
  const [dailyTarget, setDailyTarget] = useState("1")
  const [notificationEnabled, setNotificationEnabled] = useState(false)
  const [notificationTimes, setNotificationTimes] = useState<Date[]>([])
  const [editingTimeIndex, setEditingTimeIndex] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      })

      const { status } = await Notifications.requestPermissionsAsync()
      if (status !== "granted") {
        alert("Permission for notifications not granted.")
      }
    })()
  }, [])

  const toggleRepeatDay = (day: string) => {
    if (repeatDays.includes(day)) {
      setRepeatDays(repeatDays.filter((d) => d !== day))
    } else {
      setRepeatDays([...repeatDays, day])
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const createHabit = async () => {
    if (!name || repeatDays.length === 0) return

    habitStore.addHabit({
      emoji,
      name,
      time: formatTime(notificationTimes[0] || new Date()),
      finished: false,
      repeatDays,
      dailyTarget: parseInt(dailyTarget),
    })

    if (notificationEnabled && notificationTimes.length > 0) {
      for (const date of notificationTimes) {
        const hour = date.getHours()
        const minute = date.getMinutes()

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Reminder!",
            body: `Time to: ${name}`,
          },
          trigger: {
            type: "calendar",
            hour,
            minute,
            repeats: true,
          } as unknown as Notifications.NotificationTriggerInput,
        })
      }
    }

    Toast.show({
      type: "success",
      text1: "Habit Created!",
      text2: `Scheduled for: ${repeatDays.join(", ")}`,
    })

    navigation.goBack()
  }

  const handleAddNotificationTime = () => {
    setNotificationTimes([...notificationTimes, new Date()])
    setEditingTimeIndex(notificationTimes.length)
    setTempTime(new Date())
    setShowTimeModal(true)
  }

  const handleTimeConfirm = () => {
    if (editingTimeIndex !== null) {
      const updated = [...notificationTimes]
      updated[editingTimeIndex] = tempTime
      setNotificationTimes(updated)
    }
    setShowTimeModal(false)
  }

  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl * 2,
      }}
    >
      <Text text="Do a thing" preset="heading" style={{ marginBottom: spacing.md }} />

      <Text text="Habit Name" />
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
          padding: spacing.sm,
          borderRadius: 10,
          marginBottom: spacing.md,
          alignItems: "center",
        }}
      >
        <Text text={`Selected: ${emoji}  —  Tap to change`} size="md" />
      </TouchableOpacity>
      <EmojiPicker
        onEmojiSelected={(e) => {
          setEmoji(e.emoji)
          setShowEmojiPicker(false)
        }}
        open={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.sm,
        }}
      >
        <Text text="Notification Times" />
        <Switch value={notificationEnabled} onValueChange={setNotificationEnabled} />
      </View>

      {notificationEnabled && (
        <View style={{ marginBottom: spacing.md }}>
          {notificationTimes.map((t, i) => (
            <View
              key={`${t.getHours()}-${t.getMinutes()}-${i}`}
              style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.sm }}
            >
              <TouchableOpacity
                onPress={() => {
                  setEditingTimeIndex(i)
                  setTempTime(t)
                  setShowTimeModal(true)
                }}
                style={{
                  backgroundColor: colors.background,
                  padding: spacing.sm,
                  borderRadius: 10,
                  flex: 1,
                }}
              >
                <Text text={formatTime(t)} style={{ color: colors.text }} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const updated = [...notificationTimes]
                  updated.splice(i, 1)
                  setNotificationTimes(updated)
                }}
                style={{ marginLeft: spacing.sm }}
              >
                <Text text="x" style={{ color: colors.error, fontSize: 30 }} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={handleAddNotificationTime}
            style={{
              backgroundColor: colors.palette.primary100,
              padding: spacing.sm,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text text="+ Add time" style={{ color: colors.palette.primary600 }} />
          </TouchableOpacity>
        </View>
      )}

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
              <Pressable onPress={handleTimeConfirm} style={{ flex: 1, alignItems: "center" }}>
                <Text text="OK" style={{ color: colors.palette.primary500 }} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Text text="Repeat on Days" />
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
        onPress={createHabit}
        style={{
          backgroundColor: colors.palette.primary600,
          padding: spacing.md,
          borderRadius: 10,
          alignItems: "center",
          marginTop: spacing.lg,
        }}
      >
        <Text text="Add Habit" style={{ color: colors.palette.neutral100 }} />
      </TouchableOpacity>
    </Screen>
  )
})
