import * as SecureStore from "expo-secure-store"

export async function loadString(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key)
  } catch {
    return null
  }
}

export async function saveString(key: string, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, value)
    return true
  } catch {
    return false
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key)
  } catch {}
}
