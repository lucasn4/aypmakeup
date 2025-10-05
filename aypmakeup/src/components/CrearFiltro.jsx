// CrearFiltro.jsx
import React, { useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import Swal from 'sweetalert2'

export default function CrearFiltro({ onFiltroCreado }) {
    const [nombre, setNombre] = useState("");
    const { token } = useContext(UserContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim()) {
            Swal.fire({
                icon: "info",
                title: "El nombre del filtro es obligatorio",
                text: "Agregue un nombre para el filtro",
            });
            return;
        }
        if (!token) {
            alert("Debes iniciar sesión para crear filtros");
            return;
        }
        try {
            const res = await fetch("http://192.168.1.4:5000/api/filtros", {
                method: "POST",
                credentials: "include", // 👈 importante para enviar cookies
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ nombre }),
            });

            if (!res.ok) {
                throw new Error("Error al crear filtro");
            }

            const nuevoFiltro = await res.json();
            onFiltroCreado(nuevoFiltro); // actualizar estado en Tarjetas.jsx
            setNombre("");
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: "error",
                title: "Error ❌",
                text: "Hubo un error al crear el filtro",
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-crear-filtro">
            <h3>➕ Crear Filtro</h3>
            <input
                type="text"
                placeholder="Nombre del filtro (ej: Labiales)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
            />
            <button type="submit">Crear</button>
        </form>
    );
}