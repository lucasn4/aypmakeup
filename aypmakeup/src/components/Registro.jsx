import React, { useState } from "react";
import "../styles/registro.css";
import { useNavigate } from "react-router-dom";

export default function Registro() {
    const [form, setForm] = useState({
        nombre: "",
        apellido: "",
        telefono: "",
        contraseña: ""
    });
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://192.168.1.4:5000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) setMsg("Usuario registrado ✅");
            else setMsg(data.error || "Error en registro ❌");
        } catch (err) {
            setMsg("Error de conexión: ", err);
        }
    };

    return (
        <div className="registro-container">
            <form className="registro-form" onSubmit={handleSubmit}>
                <h2>Registro</h2>
                <input name="nombre" placeholder="Nombre" onChange={handleChange} required />
                <input name="apellido" placeholder="Apellido" onChange={handleChange} required />
                <input name="telefono" placeholder="Teléfono" onChange={handleChange} required />
                <input
                    type="password"
                    name="contraseña"
                    placeholder="Contraseña"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Registrarse</button>
                <button type="button" className="registro-btn" onClick={() => navigate("/")}>Inicio</button>
                {msg && <p>{msg}</p>}
            </form>
        </div>
    );
}
