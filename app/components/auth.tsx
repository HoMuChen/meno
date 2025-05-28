import { useEffect, useState, createContext, useContext } from "react";
import { useNavigate } from "@remix-run/react";
import { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export function Auth({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe: any;
    console.log("Auth effect running");
    (async () => {
      try {
        console.log("Importing firebase...");
        const { auth } = await import("../firebase");
        console.log("Importing onAuthStateChanged...");
        const { onAuthStateChanged } = await import("firebase/auth");
        console.log("Registering onAuthStateChanged...");
        unsubscribe = onAuthStateChanged(auth, (user) => {
          console.log("onAuthStateChanged fired", user);
          setUser(user);
          setLoading(false);
          if (!user) {
            navigate("/login");
          }
        });
      } catch (e) {
        console.error("Auth effect error", e);
        setLoading(false);
      }
    })();
    return () => {
      console.log("Auth effect cleanup");
      unsubscribe && unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    console.log("Loading...");
    return <div className="flex items-center justify-center h-screen text-gray-200">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
