import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Capture ambassador referral code from URL
const params = new URLSearchParams(window.location.search);
const ambCode = params.get("amb");
if (ambCode) {
  localStorage.setItem("froiv_amb_code", ambCode);
}

createRoot(document.getElementById("root")!).render(<App />);
