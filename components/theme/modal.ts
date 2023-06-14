import { modalAnatomy as parts } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys)

const baseStyle = definePartsStyle({
  dialog: {
    bg: `darkBlue`,
    borderRadius: "0",
  }
})

export const modalTheme = defineMultiStyleConfig({
  baseStyle,
})