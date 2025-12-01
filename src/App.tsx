import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/auth-context";
import { GuestCartProvider } from "./contexts/guest-cart-context";
import AppRoutes from "./routes";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <GuestCartProvider>
          <AppRoutes />
          <Toaster richColors />
        </GuestCartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
