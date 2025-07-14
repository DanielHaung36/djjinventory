import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/layout/sidebar-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/layout/language-provider"
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ThemeProvider as Tper, CssBaseline, GlobalStyles } from '@mui/material';
import theme from './app/theme';
import "./i18n"

// 应用启动调试信息
console.log('🚀 [App] 应用启动');
console.log('🔧 [App] 环境变量:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_API_HOST: import.meta.env.VITE_API_HOST,
  NODE_ENV: import.meta.env.NODE_ENV
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <Provider store={store}>
      <LanguageProvider>
      <Tper theme={theme}>
        <CssBaseline />
        {/* GlobalStyles 必须是自闭合的，不接受 children */}
        <GlobalStyles
          styles={{
            "html, body, #root": {
              height: "100%",
              margin: 0,
              overflow: "auto",
            },
          }}
        />
        {/* 然后再渲染 App */}
         <SidebarProvider>
        <App />
        <Toaster />
        </SidebarProvider>
      </Tper>
      </LanguageProvider>
    </Provider>
    </ThemeProvider>
  </StrictMode>
);
