import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const rootNode = document.getElementById("app");
const root = createRoot(rootNode!);
root.render(<App />);
