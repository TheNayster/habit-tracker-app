import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { Screen, Text } from "app/components"
import { spacing, colors } from "app/theme"
import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { HomeStackScreenProps } from "app/navigators/types"

export const CreateHabitScreen = observer(function CreateHabitScreen() {
  const { habitStore } = useStores()
  const navigation = useNavigation<HomeStackScreenProps<"CreateHabit">["navigation"]>()

  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("💪")
  const [time, setTime] = useState("08:00 AM")

  const createHabit = () => {
    if (!name) return

    habitStore.addHabit({
      emoji,
      name,
      time,
      finished: false,
    })

    navigation.goBack()
  }

  return (
    <Screen preset="scroll" contentContainerStyle={{ padding: spacing.lg }}>
      <Text text="Create a New Habit" preset="heading" style={{ marginBottom: spacing.md }} />

      <Text text="Emoji" />
      <TextInput
        value={emoji}
        onChangeText={setEmoji}
        style={{
          backgroundColor: colors.background,
          padding: spacing.sm,
          marginBottom: spacing.md,
          borderRadius: 10,
          fontSize: 24,
        }}
      />

      <Text text="Habit Name" />
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Drink Water"
        style={{
          backgroundColor: colors.background,
          padding: spacing.sm,
          marginBottom: spacing.md,
          borderRadius: 10,
        }}
      />

      <Text text="Start Time" />
      <TextInput
        value={time}
        onChangeText={setTime}
        placeholder="08:00 AM"
        style={{
          backgroundColor: colors.background,
          padding: spacing.sm,
          marginBottom: spacing.md,
          borderRadius: 10,
        }}
      />

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