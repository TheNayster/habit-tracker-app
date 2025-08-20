import AsyncStorage from "@react-native-async-storage/async-storage"

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
export async function loadString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key)
  } catch (e) {
    console.error(`Error loading string for key "${key}"`, e)
    return null
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function saveString(key: string, value: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, value)
    return true
  } catch (e) {
    console.error(`Error saving string for key "${key}"`, e)
    return false
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
export async function load(key: string): Promise<unknown | null> {
  try {
    const almostThere = await AsyncStorage.getItem(key)
    return JSON.parse(almostThere ?? "")
  } catch (e) {
    console.error(`Error loading data for key "${key}"`, e)
    return null
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
export async function save(key: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.error(`Error saving data for key "${key}"`, e)
    return false
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
export async function remove(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key)
  } catch (e) {
    console.error(`Error removing item for key "${key}"`, e)
  }
}

/**
 * Burn it all to the ground.
 */
export async function clear(): Promise<void> {
  try {
    await AsyncStorage.clear()
  } catch (e) {
    console.error("Error clearing storage", e)
  }
}
