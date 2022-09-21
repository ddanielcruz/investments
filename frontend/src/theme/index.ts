import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

const theme = extendTheme({
  styles: {
    global: (props: Record<string, any>) => ({
      body: {
        bg: mode('gray.100', 'gray.700')(props)
      }
    })
  }
})

export default theme
