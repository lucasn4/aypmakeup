import React from "react";
import { UserContext } from "../context/UserContext";

export default function BorrarTarjeta({ idtarjeta }) {

    const eliminarTarjeta = async (idtarjeta) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta tarjeta?")) return;
        console.log(idtarjeta);
        try {
            const res = await fetch(`http://192.168.1.4:5000/api/tarjetas/borrar/${idtarjeta}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // token del login
                },

            });
            if (res.ok) {
                alert("Tarjeta eliminada");
                window.location.reload();
            }
            if (!res.ok) throw new Error("Error al eliminar tarjeta");

        } catch (err) {
            console.error(err);
            alert("No se pudo eliminar la tarjeta ❌");
        }
    };
    return (
        <>
            <input
                type="button"
                value="🗑️"
                className="boton-eliminar"
                onClick={() => eliminarTarjeta(idtarjeta)}
            />
        </>
    )
}
