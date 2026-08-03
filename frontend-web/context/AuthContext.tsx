"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../app/firebase/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log("🟡 INICIANDO AUTH LISTENER");

  const unsubscribe = onAuthStateChanged(auth, (usuario) => {
    console.log("🟢 FIREBASE RESPONDIÓ:", usuario);
    console.log("🟢 CAMBIANDO LOADING A FALSE");

    setUser(usuario);
    setLoading(false);
  });

  return () => {
    console.log("🔴 AUTH LISTENER DESTRUIDO");
    unsubscribe();
  };
}, []);
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}