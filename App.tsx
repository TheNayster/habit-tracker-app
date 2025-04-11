import "@expo/metro-runtime"
import React from "react"
import * as SplashScreen from "expo-splash-screen"
import App from "./app/app"
import { StyleSheet, TextStyle, Text as RNText, TextProps as RNTextProps } from "react-native"

// 🧩 Patch 1: Log any invalid fontSize from StyleSheet.create
const originalCreate = StyleSheet.create
StyleSheet.create = (styles) => {
  for (const key in styles) {
    const style = styles[key]
    const fontSize = (style as TextStyle)?.fontSize
    if (typeof fontSize === "string" && fontSize === "large") {
      console.warn("🚨 Invalid fontSize 'large' found in style:", style)
    }
  }
  return originalCreate(styles)
}

// 🧩 Patch 2: Log invalid fontSize passed directly to <Text>
const OriginalText = RNText
function PatchedText(props: RNTextProps) {
  if (
    typeof props.style === "object" &&
    props.style &&
    !Array.isArray(props.style) &&
    (props.style as any).fontSize === "large"
  ) {
    console.warn("🚨 RNText received fontSize: 'large'", props.style)
  }

  return <OriginalText {...props} />
}

// @ts-ignore: Override the default Text component

SplashScreen.preventAutoHideAsync()

function IgniteApp() {
  return <App hideSplashScreen={SplashScreen.hideAsync} />
}

export default IgniteApp
