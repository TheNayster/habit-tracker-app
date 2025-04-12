// 🔧 Cleaned up HomeScreen.tsx for dynamic data
import { observer } from "mobx-react-lite"
import React, { FC, useCallback, useEffect, useRef, useState } from "react"
import {
  Image,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { AnimatedCircularProgress } from "react-native-circular-progress"

import { Card, Text, Toggle, Screen } from "app/components"
import layout from "app/utils/layout"
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet"

import { colors, spacing } from "../theme"
import { HomeNavProps, HomeStackScreenProps } from "app/navigators/types"
import { $tabBarStyles } from "app/navigators/styles"
import { useStores } from "app/models/helpers/useStores"
import { HabitType } from "app/models/HabitModel"



interface DayCardProps {
  day: string
  date: string
  progress: number
}

const DayCard = ({ day, date, progress }: DayCardProps) => (
  <View style={{ gap: 8 }}>
    <Text text={day} />
    <AnimatedCircularProgress
      size={32}
      width={3}
      fill={progress}
      tintColor={colors.palette.primary400}
      backgroundColor={colors.palette.neutral100}
    >
      {() => <Text text={date} size="xs" />}
    </AnimatedCircularProgress>
  </View>
)

interface HomeScreenProps extends HomeStackScreenProps<"Home"> {}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const { habitStore } = useStores()

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.xl, paddingBottom: 60 }}>
      <BottomSheetModalProvider>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <Image source={require("../../assets/images/avatar-2.png")} style={{ width: 50, height: 50 }} />
            <Text text="Today" size="xl" weight="bold" />
          </View>
          <View style={{ backgroundColor: colors.palette.primary600, width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 99 }}>
            <MaterialCommunityIcons
              name="plus"
              color={colors.palette.neutral100}
              size={28}
              onPress={() => navigation.navigate("CreateHabit")}
            />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 18 }}>
          {habitStore.days.map((d, i) => (
            <DayCard key={`day-${i}`} day={d.day} date={d.date} progress={d.progress} />
          ))}
        </View>

        <View style={{ gap: spacing.md }}>
          <Text tx="homeScreen.check_in" preset="subheading" />
          <ScrollView
            contentContainerStyle={{ gap: 20 }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {habitStore.checkIns.map((checkIn, i) => (
              <Card
                key={`${checkIn.title}-${i}`}
                style={{ borderWidth: 0, width: layout.window.width * 0.5, height: layout.window.height * 0.32 }}
                verticalAlignment="space-between"
                wrapperStyle={{ padding: spacing.sm }}
                HeadingComponent={
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
                    <View style={{ backgroundColor: colors.background, width: 48, height: 48, borderRadius: 99, alignItems: "center", justifyContent: "center" }}>
                      <Text text={checkIn.emoji} size="xl" />
                    </View>
                    <Text text={checkIn.title} size="md" />
                  </View>
                }
                ContentComponent={
                  <AnimatedCircularProgress
                    size={95}
                    width={10}
                    fill={checkIn.fill}
                    rotation={360}
                    tintColor={checkIn.color}
                    backgroundColor={colors.palette.neutral200}
                    style={{ alignSelf: "center" }}
                  >
                    {() => (
                      <View style={{ alignItems: "center" }}>
                        <Text text={checkIn.amount} size="md" />
                        <Text text={checkIn.unit} size="xs" />

                      </View>
                    )}
                  </AnimatedCircularProgress>
                }
                FooterComponent={
                  <View style={{
                    backgroundColor: colors.background,
                    padding: spacing.xs,
                    borderRadius: 10,
                    flexDirection: "row",
                    justifyContent: "space-around",
                    alignItems: "center",
                  }}>
                    <MaterialCommunityIcons name="minus" color={colors.palette.neutral500} />
                    <Text text="|" style={{ color: colors.palette.neutral500 }} />
                    <MaterialCommunityIcons name="plus" color={colors.palette.neutral500} />
                  </View>
                }
              />
            ))}
          </ScrollView>
        </View>

        <View style={{ gap: spacing.md }}>
          <Text tx="homeScreen.today" preset="subheading" />
          <View style={{ gap: 10 }}>
            {habitStore.habits.map((task, idx) => (
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

function Habit({ task, navigation }: HabitProps) {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { habitStore } = useStores()

  const handleOpenSheet = useCallback(() => {
    bottomSheetRef.current?.present()
    setIsSheetOpen(true)
  }, [])

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: isSheetOpen ? { display: "none" } : $tabBarStyles,
    })
  }, [isSheetOpen])

  return (
    <>
      <TouchableOpacity
        style={[{
          backgroundColor: colors.palette.neutral100,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: spacing.sm,
          opacity: task.finished ? 0.6 : 1,
        }]}
        onPress={handleOpenSheet}
      >
        <View style={{ flexDirection: "row", gap: 15 }}>
          <View style={{
            backgroundColor: colors.background,
            width: 44,
            height: 44,
            borderRadius: 99,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Text text={task.emoji} size="lg" />
          </View>

          <View>
            <Text text={task.name} />
            <Text text={`start at ${task.time}`} size="xs" style={{ color: colors.textDim }} />
          </View>
        </View>
        <Toggle variant="checkbox" inputOuterStyle={{
          borderColor: colors.text,
          backgroundColor: colors.palette.neutral100,
          borderWidth: 1,
        }} value={task.finished} onValueChange={() => habitStore.toggleHabit(task.id)} />
      </TouchableOpacity>
    </>
  )
}