import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./theme/ThemeProvider";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LazyMotion features={domAnimation}>
            <MotionConfig reducedMotion="user">
              <App />
            </MotionConfig>
          </LazyMotion>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
