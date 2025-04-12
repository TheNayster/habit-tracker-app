import "@expo/metro-runtime"
import React from "react"
import * as SplashScreen from "expo-splash-screen"
import App from "./app/app"
import 'react-native-get-random-values'


SplashScreen.preventAutoHideAsync()

function IgniteApp() {
  return <App hideSplashScreen={() => SplashScreen.hideAsync().then(() => true)} />
}

export default IgniteApp
