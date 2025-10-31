import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  User,
  MessageSquare,
  Plus,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import authService from "../../services/authService";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const isAuthed = Boolean(
    localStorage.getItem("token") && localStorage.getItem("refreshToken")
  );
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {}
    setIsUserMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              MarketPlace
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm xe, pin, phụ kiện..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Trang chủ
            </Link>
            <Link
              to="/search"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Tìm kiếm
            </Link>
            <Link
              to="/post-listing"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng tin</span>
            </Link>
            {!isAuthed ? (
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600"
                title="Đăng nhập"
              >
                <User className="w-6 h-6" />
              </Link>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <User className="w-6 h-6" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 text-sm">
                    <Link
                      to="/account"
                      className="px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Tài khoản của tôi
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
            <Link to="/support" className="text-gray-700 hover:text-blue-600">
              <MessageSquare className="w-6 h-6" />
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                to="/search"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Tìm kiếm
              </Link>
              <Link
                to="/post-listing"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Đăng tin
              </Link>
              {!isAuthed ? (
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              ) : (
                <>
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tài khoản của tôi
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
                  >
                    Đăng xuất
                  </button>
                </>
              )}
              <Link
                to="/support"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Hỗ trợ
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
