import * as Notifications from "expo-notifications"

export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 Test Notification",
      body: "If you're seeing this, it works!",
    },
    trigger: {
      // ✅ THIS is required for time-based triggers
      type: "timeInterval",
      seconds: 5,
      repeats: false,
    },
  })
}
