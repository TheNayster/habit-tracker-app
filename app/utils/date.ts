export function isTodayInRepeatDays(days: string[]): boolean {
  const shortDay = new Date().toLocaleDateString("en-US", { weekday: "short" }) // "Mon"
  return days.includes(shortDay)
}
