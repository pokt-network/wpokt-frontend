import { ChakraProps, extendTheme } from "@chakra-ui/react"
import { modalTheme } from "./components/theme/modal"
import { PoktButton } from "./components/theme/button"

export const colors = {
    poktBlue: "rgba(29, 138, 237, 1)",
    poktLime: "rgba(185, 240, 0, 1)",
    darkBlue: "rgba(24, 33, 41, 1)",
    darkOverlay: "rgba(255, 255, 255, 0.05)",
    warning: "rgba(247, 216, 88, 1)",
    error: "rgba(249, 50, 50, 1)",
    hover: {
        poktBlue: "rgba(29, 138, 237, 0.5)",
        poktLime: "rgba(185, 240, 0, 0.5)",
        darkBlue: "rgba(24, 33, 41, 0.5)",
    }
}

export const theme = extendTheme({
    colors,
    fonts: {
        body: `Manrope, system-ui, sans-serif`,
        heading: "Georgia, serif",
        mono: "Menlo, monospace",
    },
    configs: {
        initialColorMode: "dark",
        useSystemColorMode: false,
    },
    components: {
        Modal: modalTheme,
        Button: PoktButton
    },
    styles: {
        global: {
            'html, body': {
                color: 'white',
                backgroundColor: 'rgba(24, 33, 41, 1)',
                fontSize: '14px',
            }
        },
    }
})