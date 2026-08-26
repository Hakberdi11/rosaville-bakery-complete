import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SiteContentProvider } from "./contexts/SiteContentContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import GalleryCarousel from "./pages/GalleryCarousel";
import CustomCakes from "./pages/CustomCakes";
import Contact from "./pages/Contact";
import SpecialDessert from "./pages/SpecialDessert";

import MenuItem from "./pages/MenuItem";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import Favourites from "./pages/Favourites";
import OrderStatus from "./pages/OrderStatus";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";

function Router() {
  // Gallery Carousel renders outside Layout (no navbar/footer/cart)
  // All other routes render inside Layout
  return (
    <Switch>
      {/* Gallery Carousel - Full Screen, No Layout */}
      <Route path={"/gallery-carousel"} component={GalleryCarousel} />

      {/* All other routes with Layout (navbar, footer, cart) */}
      <Route>
        <Layout>
          <Switch>
            <Route path={"/"} component={Home} />
            <Route path={"/about"} component={About} />
            <Route path={"/menu"} component={Menu} />
            <Route path={"/menu-item/:id"} component={MenuItem} />
            <Route path={"/product/:id"} component={ProductDetail} />
            <Route path={"/cart"} component={Cart} />
            <Route path={"/checkout"} component={Checkout} />
            <Route path={"/order-status"} component={OrderStatus} />
            <Route path={"/login"} component={Login} />
            <Route path={"/signup"} component={Signup} />
            <Route path={"/forgot-password"} component={ForgotPassword} />
            <Route path={"/reset-password"} component={ResetPassword} />
            <Route path={"/account"} component={Account} />
            <Route path={"/gallery"} component={Gallery} />
            <Route path={"/favourites"} component={Favourites} />
            <Route path={"/custom-cakes"} component={CustomCakes} />
            <Route path={"/contact"} component={Contact} />
            <Route path={"/special-dessert"} component={SpecialDessert} />
            <Route path={"/404"} component={NotFound} />
            {/* Final fallback route */}
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <SiteContentProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <AuthProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </SiteContentProvider>
    </ErrorBoundary>
  );
}

export default App;
