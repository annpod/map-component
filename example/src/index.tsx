import 'react-app-polyfill/ie11'
import 'react-app-polyfill/stable'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import { ThemeProvider } from 'styled-components'
import { theme } from './theme'

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <StrictMode>
      <App />
    </StrictMode>
  </ThemeProvider>,

  document.getElementById('root')
)
