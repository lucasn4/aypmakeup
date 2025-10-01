import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { UserContext } from "../context/UserContext";

export default function Login() {
    const [form, setForm] = useState({ telefono: "", contraseña: "" });
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { loginUser } = useContext(UserContext);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://192.168.1.4:5000/api/auth/login", {
                method: "POST",
                body: JSON.stringify(form),
                headers: { "Content-Type": "application/json" },
            })
            const data = await res.json();
            if (res.ok) {
                // Guardamos token y info del usuario en context
                loginUser({ nombre: data.nombre, apellido: data.apellido, telefono: data.telefono });
                localStorage.setItem("token", data.token);
                navigate("/");
            } else {
                setMessage(data.error || "Error en login ❌");
            }
        } catch {
            setMessage("Error de conexión con el servidor");
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Iniciar Sesión</h2>
                <input type="text" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
                <input type="password" name="contraseña" placeholder="Contraseña" value={form.contraseña} onChange={handleChange} required />
                <button type="submit">Ingresar</button>
                <button type="button" className="registro-btn" onClick={() => navigate("/")}>Inicio</button>
                {message && <p className="message">{message}</p>}
            </form>
        </div>
    );
}
