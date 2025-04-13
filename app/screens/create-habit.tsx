import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Platform,
  Pressable,
} from "react-native"
import { Screen, Text } from "app/components"
import { spacing, colors } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { HomeStackScreenProps } from "app/navigators/types"
import DateTimePicker from "@react-native-community/datetimepicker"
import Toast from "react-native-toast-message"

export const CreateHabitScreen = observer(function CreateHabitScreen() {
  const { habitStore } = useStores()
  const navigation = useNavigation<HomeStackScreenProps<"CreateHabit">["navigation"]>()

  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("💪")
  const [time, setTime] = useState(new Date())
  const [tempTime, setTempTime] = useState(new Date())
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [repeatDays, setRepeatDays] = useState<string[]>([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [dailyTarget, setDailyTarget] = useState("1") // default to 1



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

  const createHabit = () => {
    if (!name || repeatDays.length === 0) return
  
    habitStore.addHabit({
      emoji,
      name,
      time: formatTime(time),
      finished: false,
      repeatDays,
      dailyTarget: parseInt(dailyTarget), 
    })
    Toast.show({
      type: "success",
      text1: "Habit Created!",
      text2: `Scheduled for: ${repeatDays.join(", ")}`,
    })
    navigation.goBack()
  }

  const favoriteEmojis = ["💪", "🧘", "😴", "🌱", "💧"]
  const emojiBank = ["💪", "🧘", "😴", "🌱", "💧", "🔥", "🎯", "📚", "🧼", "🦷", "🚰", "🏃", "🍎", "🥦", "🛌", "💤", "☕️", "📖", "🎸", "🎨", "🖊️", "🧠", "🎧", "🛁", "🌄"]
  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.xl,
      }}
    >
      <Text text="Do a thing" preset="heading" style={{ marginBottom: spacing.md }} />

      <Text text="Emoji" />
      <View style={{ flexDirection: "row", marginBottom: spacing.sm }}>
        {favoriteEmojis.map((e) => (
          <TouchableOpacity
            key={e}
            style={{
              padding: spacing.sm,
              marginRight: spacing.sm,
              backgroundColor: emoji === e ? colors.palette.primary200 : colors.palette.neutral200,
              borderRadius: 10,
            }}
            onPress={() => setEmoji(e)}
          >
            <Text text={e} size="xl" />
          </TouchableOpacity>
        ))}
      </View>

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

      <Text text="Start Time" />
      <TouchableOpacity
        onPress={() => {
          setTempTime(time)
          setShowTimeModal(true)
        }}
        style={{
          backgroundColor: colors.background,
          padding: spacing.sm,
          marginBottom: spacing.sm,
          borderRadius: 10,
        }}
      >
        <Text text={formatTime(time)} style={{ color: colors.text }} />
      </TouchableOpacity>

      <Modal visible={showTimeModal} transparent animationType="fade">
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}>
          <View style={{
            backgroundColor: "#1e1e1e",
            borderRadius: 10,
            padding: spacing.md,
            width: "80%",
            alignItems: "center",
          }}>
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={false}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                if (selectedDate) setTempTime(selectedDate)
              }}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md, width: "100%" }}>
              <Pressable onPress={() => setShowTimeModal(false)} style={{ flex: 1, alignItems: "center" }}>
                <Text text="Cancel"style={{ color: colors.palette.primary500 }}/>
              </Pressable>
              <Pressable onPress={() => { setTime(tempTime); setShowTimeModal(false) }} style={{ flex: 1, alignItems: "center" }}>
                <Text text="OK" style={{ color: colors.palette.primary500 }} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{  marginBottom: spacing.lg, alignSelf: "flex-start" }}>
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





      <Text text="Repeat on Days" />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md }}>
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

      <Modal visible={showEmojiPicker} animationType="slide">
        <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} style={{ padding: spacing.lg }}>
          <Text text="Choose an Emoji" preset="heading" style={{ marginBottom: spacing.md }} />
          <FlatList
            data={emojiBank}
            numColumns={6}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: spacing.sm,
                  margin: spacing.sm / 2,
                  backgroundColor: emoji === item ? colors.palette.primary200 : colors.palette.neutral100,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                }}
                onPress={() => {
                  setEmoji(item)
                  setShowEmojiPicker(false)
                }}
              >
                <Text text={item} size="lg" />
              </TouchableOpacity>
            )}
          />
        </Screen>
      </Modal>
    </Screen>
  )
})
