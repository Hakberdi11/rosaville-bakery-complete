import { createRoot } from "react-dom/client";
import App from "./App";
import { FavouritesProvider } from "./contexts/FavouritesContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <FavouritesProvider>
    <App />
  </FavouritesProvider>
);
