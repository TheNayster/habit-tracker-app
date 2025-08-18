import { observer } from "mobx-react-lite"
import React, { FC, useMemo } from "react"
import { TextStyle, View, ViewStyle, TouchableOpacity } from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { BarChart, barDataItem, PieChart, pieDataItem } from "react-native-gifted-charts"

import { Text, Screen } from "app/components"
import layout from "app/utils/layout"

import { colors, spacing } from "../theme"
import { StatisticsScreenProps } from "app/navigators/types"
import { useStores } from "app/models/helpers/useStores"
import { isTodayInRepeatDays } from "app/utils/date"

const filters = [
  { title: "Day", abbr: "D", id: 1 },
  { title: "Week", abbr: "W", id: 2 },
  { title: "Month", abbr: "M", id: 3 },
  { title: "Three Months", abbr: "3M", id: 4 },
  { title: "Six Months", abbr: "6M", id: 5 },
  { title: "Year", abbr: "Y", id: 6 },
]

export const StatisticsScreen: FC<StatisticsScreenProps> = observer(function StatisticsScreen() {
  const [filter, setFilter] = React.useState("D")
  const { habitStore } = useStores()
  const habitsToday = habitStore.habits.filter((h) => isTodayInRepeatDays(h.repeatDays))

  const daysToShow = useMemo(() => {
    switch (filter) {
      case "D":
        return 1
      case "W":
        return 7
      case "M":
        return 30
      case "3M":
        return 90
      case "6M":
        return 180
      case "Y":
        return 365
      default:
        return 7
    }
  }, [filter])

  const barChartData: barDataItem[] = habitStore.getDays(daysToShow).map((d) => ({
    value: d.total > 0 ? (d.progress / d.total) * 100 : 0,
    frontColor: colors.palette.primary600,
    gradientColor: colors.palette.primary100,
    label: d.day.charAt(0),
  }))

  const totalTarget = habitsToday.reduce((sum, h) => sum + h.dailyTarget, 0)
  const totalProgress = habitsToday.reduce((sum, h) => sum + h.progress, 0)
  const totalActivities = totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0

  const completedPercent = totalTarget > 0 ? (totalProgress / totalTarget) * 100 : 0
  const remainingPercent = 100 - completedPercent

  const pieData: pieDataItem[] = [
    { value: completedPercent, color: colors.palette.secondary500, focused: true },
    { value: remainingPercent, color: colors.palette.accent500 },
  ]

  const comparisonBarData: barDataItem[] =
    habitsToday.length > 0
      ? habitsToday.map((h) => ({
          value: h.progress,
          label: h.name,
          frontColor: colors.palette.primary600,
        }))
      : [{ value: 0, label: "", frontColor: colors.palette.primary600 }]

  const comparisonMax = Math.max(...habitsToday.map((h) => h.dailyTarget), 1)

  const renderDot = (color: string) => {
    return <View style={[$dotStyle, { backgroundColor: color }]} />
  }

  const renderLegendComponent = () => {
    return (
      <View style={$legendContainer}>
        <View style={$legend}>
          {renderDot(colors.palette.secondary500)}
          <Text style={{}}>Completed: {completedPercent.toFixed(0)}%</Text>
        </View>
        <View style={$legend}>
          {renderDot(colors.palette.accent500)}
          <Text style={{}}>Remaining: {remainingPercent.toFixed(0)}%</Text>
        </View>
      </View>
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <View style={$topContainer}>
        <Text text="Stats" preset="heading" />
        <MaterialCommunityIcons name="export-variant" size={24} />
      </View>
      <View style={$filtersContainer}>
        {filters.map((f, idx) => (
          <React.Fragment key={f.id}>
            <TouchableOpacity
              style={filter === f.abbr ? $activeFilter : {}}
              onPress={() => setFilter(f.abbr)}
            >
              <Text text={f.abbr} preset="bold" style={filter === f.abbr ? $activeText : {}} />
            </TouchableOpacity>
            {filters.length > idx + 1 && <Text text="•" preset="bold" />}
          </React.Fragment>
        ))}
      </View>
      <View>
        <View style={$barChartOverviewContainer}>
          <Text text="Total Activities" preset="formLabel" />
          <Text text={`${totalActivities}%`} preset="heading" />
        </View>
        <View style={$barChartContainer}>
          <BarChart
            data={barChartData}
            barWidth={20}
            width={layout.window.width * 0.77}
            height={layout.window.height * 0.3}
            initialSpacing={spacing.xs}
            spacing={spacing.lg}
            barBorderRadius={spacing.sm}
            yAxisThickness={0}
            noOfSections={5}
            xAxisType={"dashed"}
            xAxisColor={colors.palette.neutral400}
            yAxisTextStyle={{ color: colors.textDim }}
            stepValue={20}
            maxValue={100}
            yAxisLabelTexts={["0", "20", "40", "60", "80", "100"]}
            xAxisLabelTextStyle={$xAxisLabelText}
            yAxisLabelSuffix="%"
            showLine
            // hideYAxisText
            // hideRules
            lineConfig={{
              color: colors.palette.accent500,
              thickness: 3,
              curved: true,
              hideDataPoints: true,
              shiftY: 20,
            }}
          />
        </View>
      </View>

      <View style={{ gap: spacing.xl, marginTop: spacing.md }}>
        <Text text="Daily Habits Overview" preset="formLabel" />
        <View style={$pieChartContainer}>
          <PieChart
            data={pieData}
            donut
            showGradient
            sectionAutoFocus
            radius={90}
            innerRadius={60}
            innerCircleColor={colors.palette.secondary500}
            centerLabelComponent={() => {
              return (
                <View style={$pieChartLabelContainer}>
                  <Text
                    text={`${completedPercent.toFixed(0)}%`}
                    preset="subheading"
                    style={{ color: colors.palette.neutral100 }}
                  />
                  <Text
                    text="Completed"
                    preset="formLabel"
                    style={{ color: colors.palette.neutral100 }}
                  />
                </View>
              )
            }}
          />
          <View>{renderLegendComponent()}</View>
        </View>
      </View>

      <View>
        <Text text="Habits Comparison" preset="formLabel" style={{ marginVertical: spacing.xl }} />
        <BarChart
          data={comparisonBarData}
          barWidth={20}
          spacing={spacing.md}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.textDim }}
          noOfSections={comparisonMax}
          stepValue={1}
          maxValue={comparisonMax}
        />
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $topContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $xAxisLabelText: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
}

const $barChartContainer: ViewStyle = {
  overflow: "hidden",
}

const $barChartOverviewContainer: ViewStyle = {
  marginBottom: spacing.xs,
}

const $filtersContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $activeFilter: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderRadius: 99,
  width: 36,
  height: 36,
  justifyContent: "center",
  alignItems: "center",
}

const $activeText: TextStyle = {
  color: colors.palette.neutral100,
  textAlign: "center",
}

const $dotStyle: ViewStyle = {
  height: 10,
  width: 10,
  borderRadius: 5,
  marginRight: 10,
}

const $legendContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "center",
  marginBottom: 10,
}

const $legend: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  width: "50%",
}

const $pieChartContainer: ViewStyle = {
  alignItems: "center",
  width: "100%",
  gap: spacing.md,
}

const $pieChartLabelContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
}
