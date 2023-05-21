import { extendTheme } from "@chakra-ui/react"

export const colors = {
    poktBlue: "rgba(29, 138, 237, 1)",
    poktLime: "rgba(185, 240, 0, 1)",
    darkBlue: "rgba(24, 33, 41, 1)",
    darkOverlay: "rgba(255, 255, 255, 0.05)",
    warning: "rgba(247, 216, 88, 1)",
    error: "rgba(249, 50, 50, 1)"
}

export const theme = extendTheme({
    colors,
})