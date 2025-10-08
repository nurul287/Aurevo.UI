import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import { GuestCartProvider } from "./contexts/guest-cart-context";
import AppRoutes from "./routes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <GuestCartProvider>
          <AppRoutes />
        </GuestCartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
