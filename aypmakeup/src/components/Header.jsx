// src/components/Header.jsx
import React, { useMemo, useState, useContext } from "react";
import "../styles/header.css";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Header({ brand = "A&P MAKEUP", cta, onCtaClick }) {
  const [open, setOpen] = useState(false);
  const pathname = useMemo(() => (typeof window !== "undefined" ? window.location.pathname : "/"), []);
  const navigate = useNavigate();
  const { user, logoutUser } = useContext(UserContext);


  const handleLogout = async () => {
    await logoutUser();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="brand">
          <img src="/logorecortado32.png" alt="Logo" className="logo-img" />
          <span>{brand}</span>
        </Link>

        <div className="actions">
          
          {!user ? (
            cta?.label && <button onClick={onCtaClick ? onCtaClick : () => navigate("/login")} className="cta">{cta.label}</button>
          ) : (
            <>
              <span className="user-name">{user.nombre} {user.apellido}</span>
              <button type="button" className="cta"><Link to="/notificaciones" className={`drawer-link ${pathname === "/notificaciones" ? "active" : ""}`} onClick={() => setOpen(false)}>🔔</Link></button>
              <button type="button" className="cta" onClick={() => navigate("/registro")}>Registro</button>
              <button className="cta" onClick={handleLogout}>Salir</button>
            </>
          )}

          <button onClick={() => setOpen(!open)} className="menu-toggle" aria-label="Abrir menú">☰</button>
        </div>
      </div>

      {open && (
        <div className="drawer">
          <div className="drawer-header">
            <span>{brand}</span>
            <button onClick={() => setOpen(false)} className="close-btn">✕</button>
          </div>

          {user && (
            <div className="drawer-user">
              <p>👋 Bienvenida</p>
              <strong>{user.nombre} {user.apellido}</strong>
            </div>
          )}

          <div className="drawer-links">
            <Link to="/" className={`drawer-link ${pathname === "/" ? "active" : ""}`} onClick={() => setOpen(false)}>Inicio</Link>

            {!user ? (
              <Link to="/login" className={`drawer-link ${pathname === "/login" ? "active" : ""}`} onClick={() => setOpen(false)}>Login</Link>
            ) : (
              <>
                <Link to="/registro" className={`drawer-link ${pathname === "/registro" ? "active" : ""}`} onClick={() => setOpen(false)}>Registro</Link>
                <button className="drawer-link" onClick={() => { handleLogout(); setOpen(false); }}>Salir</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
