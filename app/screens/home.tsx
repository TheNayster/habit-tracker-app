// 🔧 Finalized HomeScreen.tsx with animated goal overlay and polished UX
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import {
  Image,
  View,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
  PlatformColor,
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { Text, Screen } from "app/components"
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { colors, spacing } from "../theme"
import { HomeNavProps, HomeStackScreenProps } from "app/navigators/types"
import { $tabBarStyles } from "app/navigators/styles"
import { useStores } from "app/models/helpers/useStores"
import { HabitType } from "app/models/HabitModel"
import { isTodayInRepeatDays } from "../utils/date"

const COLORS = ["#FFFF00", "#99FF99", "#E0FFFF", "#FFDAB9", "#EFEFEF"]

if (Platform.OS === "android") UIManager.setLayoutAnimationEnabledExperimental?.(true)

const accentColor = Platform.OS === "ios" ? PlatformColor("systemBlue") : "#0A84FF"

const DayCard = ({ day, date, progress }: { day: string; date: string; progress: number }) => (
  <View style={{ gap: 8, alignItems: "center" }}>
    <Text text={day} />
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: progress > 0 ? accentColor : colors.palette.neutral200,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        text={date}
        size="xs"
        style={{ color: progress > 0 ? colors.palette.neutral100 : colors.text }}
      />
    </View>
  </View>
)

interface HomeScreenProps extends HomeStackScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const { habitStore, userStore } = useStores()

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.xl, paddingBottom: 60 }}
    >
      <BottomSheetModalProvider>
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("SettingsStack", { screen: "PersonalInfos" })}
            >
              <Image
                source={
                  userStore.avatar
                    ? { uri: userStore.avatar }
                    : require("../../assets/images/avatar-2.png")
                }
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            </TouchableOpacity>
            <Text text="Today" size="xl" weight="bold" />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Calendar")}>
            <MaterialCommunityIcons name="calendar-month-outline" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 18 }}>
          {habitStore.days.map((d, i) => (
            <DayCard key={`day-${i}`} day={d.day} date={d.date} progress={d.progress} />
          ))}
        </View>

        <View style={{ gap: spacing.md }}>
          <Text tx="homeScreen.today" preset="subheading" />
          <View style={{ gap: 10 }}>
            {habitStore.habits
              .filter((habit) => isTodayInRepeatDays(habit.repeatDays))
              .map((task, idx) => (
                <Habit key={`${task.id}-${idx}`} task={task} navigation={navigation} />
              ))}
          </View>
        </View>
      </BottomSheetModalProvider>
    </Screen>
  )
})

interface HabitProps {
  task: HabitType
  navigation: HomeNavProps
}

const Habit = observer(function Habit({ task, navigation }: HabitProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [animatedScale] = useState(new Animated.Value(1))
  const { habitStore } = useStores()

  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.present()
    setIsSheetOpen(true)
  }, [])

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: isSheetOpen ? { display: "none" } : $tabBarStyles(),
    })
  }, [isSheetOpen])

  const filledColor = COLORS[Math.floor(task.progress % COLORS.length)]
  const completed = task.progress >= task.dailyTarget

  const triggerTileBounce = () => {
    Animated.sequence([
      Animated.timing(animatedScale, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(animatedScale, { toValue: 1.0, duration: 150, useNativeDriver: true }),
    ]).start()
  }

  const handleAdd = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    const wasOneAway = task.progress === task.dailyTarget - 1
    habitStore.incrementHabit(task.id)
    if (wasOneAway) triggerTileBounce()
  }

  const handleSubtract = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    habitStore.decrementHabit(task.id)
  }

  return (
    <Animated.View
      style={{
        backgroundColor: colors.palette.neutral100,
        padding: spacing.sm,
        borderRadius: spacing.sm,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        transform: [{ scale: animatedScale }],
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: "row",
          overflow: "hidden",
          borderRadius: spacing.sm,
        }}
      >
        {[...Array(task.dailyTarget)].map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: i < task.progress ? filledColor : colors.palette.neutral300,
              margin: 1,
            }}
          />
        ))}
      </View>

      <TouchableOpacity
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        onPress={handleOpenSheet}
      >
        <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
          <View
            style={{
              backgroundColor: colors.background,
              width: 44,
              height: 44,
              borderRadius: 99,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text text={task.emoji} size="lg" />
          </View>
          <View>
            <Text text={task.name} weight="bold" style={{ color: colors.text, fontSize: 16 }} />
            <Text
              text={task.time ? `Start at ${task.time}` : "Unscheduled"}
              weight="bold"
              size="xs"
              style={{ color: colors.text, fontSize: 16 }}
            />
          </View>
        </View>
      </TouchableOpacity>

      {completed && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: spacing.sm,
            zIndex: 10,
          }}
        >
          <TouchableOpacity
            onPress={handleSubtract}
            style={{
              position: "absolute",
              top: spacing.sm,
              right: spacing.sm,
              padding: 4,
            }}
          >
            <MaterialCommunityIcons name="close-circle" size={24} color="#fff" />
          </TouchableOpacity>
          <Text
            text={`🎉 You did it!\nGreat job on "${task.name}"`}
            style={{
              color: "#E0E0E0", // Softer than pure white
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 14,
            }}
          />
        </View>
      )}

      <View
        style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm }}
      >
        <TouchableOpacity onPress={handleSubtract}>
          <MaterialCommunityIcons name="minus-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("HomeStack", {
              screen: "EditHabit",
              params: { habitId: task.id },
            })
          }
        >
          <MaterialCommunityIcons name="pencil-outline" size={24} color={colors.tint} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAdd}>
          <MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  )
})
