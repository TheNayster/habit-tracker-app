import * as Notifications from "expo-notifications"
import { HabitStore } from "../models/HabitStore"

export async function syncNotifications(habitStore: typeof HabitStore.Type) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const knownIds = habitStore.habits.map(h => h.notificationId).filter(Boolean)
  const orphans = scheduled.filter(n => !knownIds.includes(n.identifier))

  for (const orphan of orphans) {
    await Notifications.cancelScheduledNotificationAsync(orphan.identifier)
  }

  console.log(`🧹 Removed ${orphans.length} orphaned notifications`)
}