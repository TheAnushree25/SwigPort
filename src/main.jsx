import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter-tight'
import 'lenis/dist/lenis.css'
import './styles/base.css'
import './styles/app.css'
import App from './App'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

console.log(
  `%c
  ███████ ██     ██ ██  ██████  ██████   ██████  ██████  ████████
  ██      ██     ██ ██ ██       ██   ██ ██    ██ ██   ██    ██
  ███████ ██  █  ██ ██ ██   ███ ██████  ██    ██ ██████     ██
       ██ ██ ███ ██ ██ ██    ██ ██      ██    ██ ██   ██    ██
  ███████  ███ ███  ██  ██████  ██       ██████  ██   ██    ██

  Shirsha Bhattacharjee — poured in Kolkata.
  [*] Frontend ...... React / GSAP / three.js / Lenis
  [*] Type .......... Inter Tight
  [*] Say hi ........ press "/" anywhere and type
`,
  'color:#e2323e;font-family:monospace;font-size:10px',
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
