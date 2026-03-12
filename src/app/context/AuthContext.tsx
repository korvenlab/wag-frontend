import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  email: string;
  name: string;
  hasPaid: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  updatePaymentStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, name: string) => {
    setUser({
      email,
      name,
      hasPaid: false, // Usuário começa sem ter pago
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updatePaymentStatus = (status: boolean) => {
    if (user) {
      setUser({ ...user, hasPaid: status });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePaymentStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
