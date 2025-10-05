import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si ya hay sesión activa (con cookie)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://192.168.1.4:5000/api/auth/me", {
          method: "GET",
          credentials: "include", // 👈 importante para mandar cookies
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error verificando sesión:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const loginUser = (userData) => {
    setUser(userData);
  };

  const logoutUser = async () => {
    try {
      await fetch("http://192.168.1.4:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      setUser(null);
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
}
