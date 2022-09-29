/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";

import './index.css';
import App from './App';
import { HopeProvider, HopeThemeConfig } from '@hope-ui/solid';

const config: HopeThemeConfig = {
  lightTheme: {
    colors: {
      primary9: "#ea2c04",
      primary10: "#b92000"
    }
  }
}

render(() => (
  <Router>
    <HopeProvider config={config}>
      <App />
    </HopeProvider>
  </Router>
), document.getElementById('root') as HTMLElement);
