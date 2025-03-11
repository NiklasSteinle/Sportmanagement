import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, getAuth } from "firebase/auth";
import { auth } from "../../firebaseconfig";
import { useRouter, usePathname } from "next/navigation";


interface AuthContextProps {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Authentifizierungsstatus überwachen
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Zentralisierte Weiterleitung für geschützte Seiten
  useEffect(() => {
    const PUBLIC_ROUTES = ["/auth/signin", "/auth/signup", "/auth/studentsignup"]; // Definiere öffentliche Routen
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
    if (!loading && !user && !isPublicRoute) {
      router.push("/auth/signin");
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
