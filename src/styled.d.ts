// TODO - Review implementation of the theme. Investigate how we can include the  theme provider  within map component library.

import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    route: {
      color: string
      width: string
      dashColor: string
      dashWidth: number
      animationIterationCount: number | string
    }
    label: {
      font: {
        family: string
        wight: number
        size: string
        maxWidth: string
        lineHeight: number
        color: string
      }
    }
    backgroundColor: string
    statusColors: {
      normal: Record<string, string>
      impaired: Record<string, string>
    }
  }
}
