import * as Notifications from "expo-notifications"
import { HabitStore } from "../models/HabitStore"

export async function syncNotifications(habitStore: typeof HabitStore.Type) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const knownIds = habitStore.habits.flatMap((h) => h.notificationIds)
  const orphans = scheduled.filter((n) => !knownIds.includes(n.identifier))

  for (const orphan of orphans) {
    await Notifications.cancelScheduledNotificationAsync(orphan.identifier)
  }

  console.log(`🧹 Removed ${orphans.length} orphaned notifications`)
}