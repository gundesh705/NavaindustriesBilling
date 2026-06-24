import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";

import "./styles/index.css";
import "@fontsource/archivo-black/index.css";

createRoot(document.getElementById("root")!).render(
  <App />
);