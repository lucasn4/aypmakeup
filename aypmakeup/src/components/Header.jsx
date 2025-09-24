import React, { useEffect, useMemo, useState, useContext } from "react";
import "../styles/header.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Header({ brand = "MiApp", cta, onCtaClick }) {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const pathname = useMemo(
    () => (typeof window !== "undefined" ? window.location.pathname : "/"),
    []
  );

  // Theme toggle
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored ? stored === "dark" : prefersDark;
    setIsDark(initial);
    document.documentElement.classList.toggle("dark", initial);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const navigate = useNavigate();
  const { user, logoutUser } = useContext(UserContext);

  const handleLogout = () => {
    logoutUser();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className={`header ${isDark ? "dark" : ""}`}>
      <div className="header-container">
        <Link to="/" className="brand">
          <img
            src="../../public/logorecortado32.png"
            alt="Logo"
            className="logo-img"
          />
          <span>{brand}</span>
        </Link>

        <div className="actions">
          <button onClick={toggleTheme} className="theme-toggle">
            {isDark ? "☀️" : "🌙"}
          </button>

          {!user ? (
            cta?.label && (
              <button
                onClick={onCtaClick ? onCtaClick : () => navigate("/login")}
                className="cta"
              >
                {cta.label}
              </button>
            )
          ) : (
            <>
              <span className="user-name">
                {user.nombre} {user.apellido}
              </span>
              <button
                type="button"
                className="cta"
                onClick={() => navigate("/registro")}
              >
                Registro
              </button>
              <button className="cta" onClick={handleLogout}>
                Salir
              </button>
            </>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="menu-toggle"
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="drawer">
          <div className="drawer-header">
            <span>{brand}</span>
            <button onClick={() => setOpen(false)} className="close-btn">
              ✕
            </button>
          </div>

          {/* 👇 Bienvenida si está logueado */}
          {user && (
            <div className="drawer-user">
              <p>👋 Bienvenido</p>
              <strong>
                {user.nombre} {user.apellido}
              </strong>
            </div>
          )}

          <div className="drawer-links">
            <Link
              to="/"
              className={`drawer-link ${pathname === "/" ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              Inicio
            </Link>

            {!user ? (
              <Link
                to="/login"
                className={`drawer-link ${pathname === "/login" ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
            ) : (
              <>
                <Link
                  to="/registro"
                  className={`drawer-link ${
                    pathname === "/registro" ? "active" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  Registro
                </Link>
                <button
                  className="drawer-link"
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                >
                  Salir
                </button>
              </>
            )}
          </div>

          <div className="drawer-actions">
            <button onClick={toggleTheme} className="theme-toggle">
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
