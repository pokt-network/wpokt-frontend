import { ChakraProps, extendTheme } from "@chakra-ui/react"
import { modalTheme } from "./components/theme/modal"
import { PoktButton } from "./components/theme/button"

export const colors = {
    poktBlue: "rgba(105, 141, 255, 1)", // blue
    poktLime: "rgba(255, 255, 255, 1)", // white
    darkBlue: "rgba(35, 31, 32, 1)", // charcoal
    darkOverlay: "rgba(255, 255, 255, 0.05)",
    warning: "rgba(247, 216, 88, 1)",
    error: "rgba(221, 0, 53, 1)",
    hover: {
        poktBlue: "rgba(105, 141, 255, 0.5)",
        poktLime: "rgba(255, 255, 255, 0.5)",
        darkBlue: "rgba(35, 31, 32, 0.5)",
    }
}

export const theme = extendTheme({
    colors,
    fonts: {
        body: `Manrope, system-ui, sans-serif`,
        heading: "Manrope, Georgia, serif",
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
                backgroundColor: 'rgba(35, 31, 32, 1)',
                fontSize: '14px',
            }
        },
    }
})