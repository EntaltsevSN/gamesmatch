import React from "react";
import ReactDOM from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import App from "./App.jsx";
import "@mantine/core/styles.css";
import "./index.css";

const theme = createTheme({
  fontFamily: "Rubik, Inter, Segoe UI, Roboto, Arial, sans-serif",
  headings: {
    fontFamily: "Rubik, Inter, Segoe UI, Roboto, Arial, sans-serif",
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>
);
