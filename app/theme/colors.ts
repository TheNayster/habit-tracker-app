// TODO: write documentation for colors and palette in own markdown file and add links from here

const lightPalette = {
  neutral100: "#FFFFFF",
  neutral200: "#F4F2F1",
  neutral300: "#D7CEC9",
  neutral400: "#B6ACA6",
  neutral500: "#978F8A",
  neutral600: "#564E4A",
  neutral700: "#3C3836",
  neutral800: "#191015",
  neutral900: "#000000",

  primary100: "#F4E0D9",
  primary200: "#E8C1B4",
  primary300: "#DDA28E",
  primary400: "#D28468",
  primary500: "#C76542",
  primary600: "#A54F31",

  secondary100: "#DCDDE9",
  secondary200: "#BCC0D6",
  secondary300: "#9196B9",
  secondary400: "#626894",
  secondary500: "#41476E",

  accent100: "#FFEED4",
  accent200: "#FFE1B2",
  accent300: "#FDD495",
  accent400: "#FBC878",
  accent500: "#FFBB50",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  success: "#56C568",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

const darkPalette = {
  neutral100: "#000000",
  neutral200: "#191015",
  neutral300: "#3C3836",
  neutral400: "#564E4A",
  neutral500: "#978F8A",
  neutral600: "#B6ACA6",
  neutral700: "#D7CEC9",
  neutral800: "#F4F2F1",
  neutral900: "#FFFFFF",

  primary100: "#F4E0D9",
  primary200: "#E8C1B4",
  primary300: "#DDA28E",
  primary400: "#D28468",
  primary500: "#C76542",
  primary600: "#A54F31",

  secondary100: "#DCDDE9",
  secondary200: "#BCC0D6",
  secondary300: "#9196B9",
  secondary400: "#626894",
  secondary500: "#41476E",

  accent100: "#FFEED4",
  accent200: "#FFE1B2",
  accent300: "#FDD495",
  accent400: "#FBC878",
  accent500: "#FFBB50",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  success: "#56C568",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

let colorScheme: "light" | "dark" = "light"

const buildColors = (scheme: "light" | "dark") => {
  const palette = scheme === "dark" ? darkPalette : lightPalette
  return {
    /**
     * The palette is available to use, but prefer using the name.
     * This is only included for rare, one-off cases. Try to use
     * semantic names as much as possible.
     */
    palette,
    /**
     * A helper for making something see-thru.
     */
    transparent: "rgba(0, 0, 0, 0)",
    /**
     * The default text color in many components.
     */
    text: scheme === "dark" ? palette.neutral900 : palette.neutral800,
    /**
     * Secondary text information.
     */
    textDim: scheme === "dark" ? palette.neutral700 : palette.neutral600,
    /**
     * The default color of the screen background.
     */
    background: scheme === "dark" ? palette.neutral100 : palette.neutral200,
    /**
     * The default border color.
     */
    border: scheme === "dark" ? palette.neutral300 : palette.neutral400,
    /**
     * The main tinting color.
     */
    tint: palette.primary500,
    /**
     * A subtle color used for lines.
     */
    separator: scheme === "dark" ? palette.neutral300 : palette.neutral300,
    /**
     * Error messages.
     */
    error: palette.angry500,
    /**
     * Error Background.
     */
    errorBackground: palette.angry100,
    /**
     * Success messages
     */
    success: palette.success,
  }
}

export let colors = buildColors(colorScheme)

export const setColorScheme = (scheme: "light" | "dark") => {
  colorScheme = scheme
  colors = buildColors(scheme)
}

export const getColorScheme = () => colorScheme
