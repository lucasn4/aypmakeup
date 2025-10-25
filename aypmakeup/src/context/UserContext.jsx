// src/context/UserContext.jsx
import React, { createContext, useEffect, useState } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener CSRF token y estado de sesión al iniciar
  useEffect(() => {
    const init = async () => {
      try {
        // 1) obtener CSRF token
        const tRes = await fetch("http://192.168.1.4:5000/api/csrf-token", {
          credentials: "include",
        });
        if (tRes.ok) {
          const td = await tRes.json();
          setCsrfToken(td.csrfToken);
          sessionStorage.setItem("csrfToken", td.csrfToken);
        }

        // 2) preguntar /me por si ya hay sesión
        const meRes = await fetch("http://192.168.1.4:5000/api/auth/me", {
          credentials: "include",
        });
        if (meRes.ok) {
          const md = await meRes.json();
          setUser(md.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("UserContext init error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // login: hace POST /api/auth/login y actualiza user
  const loginUser = async (telefono, contraseña) => {
    try {
      const token = sessionStorage.getItem("csrfToken");
      const res = await fetch("http://192.168.1.4:5000/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": token || "",
        },
        body: JSON.stringify({ telefono, contraseña }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en login");

      // backend devuelve user en body
      if (data.user) {
        setUser(data.user);
        return { ok: true };
      }

      return { ok: false, error: data.error || "Respuesta inesperada" };
    } catch (err) {
      console.error("loginUser error:", err);
      return { ok: false, error: err.message || "Error de conexión" };
    }
  };

  const logoutUser = async () => {
    try {
      await fetch("http://192.168.1.4:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "CSRF-Token": sessionStorage.getItem("csrfToken") || "",
        },
      });
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{ user, csrfToken, loading, loginUser, logoutUser }}
    >
      {children}
    </UserContext.Provider>
  );
}
