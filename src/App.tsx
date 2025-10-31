import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import ChatBot from "./components/Common/ChatBot";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import PostListingPage from "./pages/PostListingPage";
import AccountPage from "./pages/AccountPage";
import SupportPage from "./pages/SupportPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
// Thêm dòng này:
import RequireAuth from "./components/Auth/RequireAuth";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrderPage from "./pages/OrderPage";
import PriceSuggestion from "./components/Common/PriceSuggestion";

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

const AppLayout = () => {
  const location = useLocation();
  const hideChrome =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideChrome && <Header />}

      <main className={hideChrome ? "" : "flex-1"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/order/:id" element={<OrderPage />} />
          {/* Các route cần đăng nhập */}
          <Route
            path="/post-listing"
            element={
              <RequireAuth>
                <PostListingPage />
              </RequireAuth>
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            }
          />
          {/* Các route công khai */}
          <Route path="/support" element={<SupportPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!hideChrome && (
        <>
          <Footer />
          <PriceSuggestion />
          <ChatBot />
        </>
      )}
    </div>
  );
};

export default App;
