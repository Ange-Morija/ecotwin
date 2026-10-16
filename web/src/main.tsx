import { createRoot } from "react-dom/client";
import App from "./App";
import "../styles/platform.css";
import "./react.css";
import "./services.css";
const element = document.getElementById("app");
if (element) createRoot(element).render(<App />);
