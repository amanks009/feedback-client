'use client';
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { getToken, setToken, clearToken } from "./api";

type User = {
  id: number;
  name: string;
  email: string;
  role: "Manager" | "Employee";
  manager_id?: number | null;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  role: "Manager" | "Employee";
  manager_id?: number;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {}, // Fixed the implementation
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = getToken();
      if (token) {
        const res = await api.get("/me");
        setUser(res.data);
      }
    } catch (err) {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const register = async (data: RegisterData) => {
    try {
      await api.post("/register", data);
      // Automatically login after successful registration
      // await login(data.email, data.password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);
    
    const res = await api.post("/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    
    setToken(res.data.access_token);
    await fetchUser(); // Ensure user is fetched after login
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}> {/* Fixed typo in 'register' */}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}