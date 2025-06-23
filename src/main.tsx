import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import theme from './app/theme';
import "./i18n"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* GlobalStyles 必须是自闭合的，不接受 children */}
        <GlobalStyles
          styles={{
            "html, body, #root": {
              height: "100%",
              margin: 0,
              overflow: "hidden",
            },
          }}
        />
        {/* 然后再渲染 App */}
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
