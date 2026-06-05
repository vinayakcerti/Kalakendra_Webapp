import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";
import { API_BASE } from "./lib/api";

// Point the Orval-generated API client at the correct backend
setBaseUrl(API_BASE || null);

createRoot(document.getElementById("root")!).render(<App />);
