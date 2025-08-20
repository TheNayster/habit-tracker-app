import * as SecureStore from "expo-secure-store"

export async function loadString(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key)
  } catch (e) {
    console.error(`Failed to load secure item for key "${key}"`, e)
    return null
  }
}

export async function saveString(key: string, value: string): Promise<boolean> {
  try {
    await SecureStore.setItemAsync(key, value)
    return true
  } catch (e) {
    console.error(`Failed to save secure item for key "${key}"`, e)
    return false
  }
}

export async function remove(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key)
  } catch (e) {
    console.error(`Failed to remove secure item for key "${key}"`, e)
  }
}
