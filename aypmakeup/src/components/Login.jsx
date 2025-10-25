// src/components/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import "../styles/login.css";

export default function Login() {
  const [form, setForm] = useState({ telefono: "", contraseña: "" });
  const navigate = useNavigate();
  const { loginUser } = useContext(UserContext);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { telefono, contraseña } = form;

    const res = await loginUser(telefono, contraseña);
    if (res.ok) {
      Swal.fire("Bienvenido", "Has iniciado sesión correctamente", "success");
      navigate("/");
    } else {
      Swal.fire("Error", res.error || "Credenciales inválidas", "error");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="contraseña"
          placeholder="Contraseña"
          value={form.contraseña}
          onChange={handleChange}
          required
        />
        <button type="submit">Ingresar</button>
        <button type="button" className="registro-btn" onClick={() => navigate("/")}>Inicio</button>
      </form>
    </div>
  );
}
