import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Lock, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleDashboardClick = () => {
    if (!user?.hasPaid) {
      return;
    }
    navigate("/dashboard");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-5"
    >
      <div
        className={`max-w-[1200px] mx-auto h-20 rounded-[50px] bg-white/80 backdrop-blur-[12px] transition-all duration-300 ${
          isScrolled
            ? "shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
            : "shadow-[0_4px_30px_rgba(0,0,0,0.05)]"
        }`}
      >
        <div className="px-6 h-full flex items-center justify-between">
          {/* Logo Limpa e 3x Maior */}
          <motion.div
            className="flex items-center cursor-pointer flex-shrink-0"
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
          >
            <div className="w-50 h-50 flex items-center justify-center flex-shrink-0">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <NavLink onClick={() => scrollToSection("como-funciona")}>
              Como Funciona
            </NavLink>
            <NavLink onClick={() => scrollToSection("precos")}>
              Preços
            </NavLink>
            <NavLink onClick={() => scrollToSection("faq")}>FAQ</NavLink>
          </nav>

          <div className="hidden md:flex items-center flex-shrink-0">
            {user ? (
              <div ref={dropdownRef} className="relative">
                <motion.button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 30px rgba(0, 123, 255, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#007BFF] to-[#6F42C1] text-white font-semibold shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
                >
                  <span className="max-w-[150px] truncate">{user.email}</span>
                  <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Conectado como</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={handleDashboardClick}
                          disabled={!user.hasPaid}
                          className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                            user.hasPaid
                              ? "text-gray-700 hover:bg-gray-50 cursor-pointer"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <LayoutDashboard size={18} />
                          <span className="text-sm font-medium">Dashboard</span>
                          {!user.hasPaid && <Lock size={14} className="ml-auto" />}
                        </button>

                        {!user.hasPaid && (
                          <div className="px-4 py-2 mx-2 mb-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-xs text-amber-800 font-medium">
                              💳 Complete o pagamento para acessar
                            </p>
                          </div>
                        )}

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Sair</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 30px rgba(0, 123, 255, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#007BFF] to-[#6F42C1] text-white font-semibold shadow-md hover:shadow-lg transition-shadow"
              >
                Login
              </motion.button>
            )}
          </div>

          <button
            className="md:hidden text-gray-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden mt-3 mx-4 rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-lg overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <MobileNavLink onClick={() => scrollToSection("como-funciona")}>
                Como Funciona
              </MobileNavLink>
              <MobileNavLink onClick={() => scrollToSection("precos")}>
                Preços
              </MobileNavLink>
              <MobileNavLink onClick={() => scrollToSection("faq")}>
                FAQ
              </MobileNavLink>

              {user ? (
                <>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Conectado como</p>
                    <p className="text-sm font-semibold text-gray-900 truncate mb-4">{user.email}</p>

                    <button
                      onClick={handleDashboardClick}
                      disabled={!user.hasPaid}
                      className={`w-full px-4 py-2.5 rounded-lg mb-2 flex items-center justify-center gap-2 ${
                        user.hasPaid
                          ? "bg-gradient-to-r from-[#007BFF] to-[#6F42C1] text-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                      {!user.hasPaid && <Lock size={14} />}
                    </button>

                    {!user.hasPaid && (
                      <div className="px-4 py-2 mb-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800 font-medium">
                          💳 Complete o pagamento para acessar
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 font-semibold flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Sair
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#007BFF] to-[#6F42C1] text-white font-semibold shadow-md"
                >
                  Login
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function NavLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="text-gray-700 hover:text-gray-900 transition-colors relative group font-medium text-sm"
      whileHover={{ y: -2 }}
    >
      {children}
      <motion.span
        className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#007BFF] to-[#6F42C1] group-hover:w-full transition-all duration-300"
      />
    </motion.button>
  );
}

function MobileNavLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-gray-600 hover:text-gray-900 transition-colors text-left py-2"
    >
      {children}
    </button>
  );
}
