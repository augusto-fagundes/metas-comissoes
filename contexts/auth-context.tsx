"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: number;
  nome: string;
  email: string;
  tipo: "admin" | "colaborador";
  colaboradorId?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  changePassword: (
    email: string,
    current: string,
    newPass: string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    // Simulação de login
    if (email === "admin@empresa.com" && password === "admin") {
      setUser({
        id: 1,
        nome: "Admin User",
        email: "admin@empresa.com",
        tipo: "admin",
      });
      return true;
    }
    if (email === "joao@empresa.com" && password === "123") {
      setUser({
        id: 2,
        nome: "João Silva",
        email: "joao@empresa.com",
        tipo: "colaborador",
        colaboradorId: 1,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const changePassword = async (
    email: string,
    current: string,
    newPass: string
  ) => {
    // Simulação de alteração de senha
    if (email === "admin@empresa.com" && current === "admin") {
      toast({
        title: "Alteração de senha simulada",
        description:
          "Senha de admin alterada. Para simular o login, use a nova senha.",
      });
      // Na prática, você atualizaria o estado ou enviaria para um backend
      return true;
    }
    if (email === "joao@empresa.com" && current === "123") {
      toast({
        title: "Alteração de senha simulada",
        description:
          "Senha de João alterada. Para simular o login, use a nova senha.",
      });
      // Na prática, você atualizaria o estado ou enviaria para um backend
      return true;
    }
    return false;
  };

  const isAuthenticated = !!user;
  const isAdmin = () => user?.tipo === "admin";

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated, isAdmin, changePassword }}
    >
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
