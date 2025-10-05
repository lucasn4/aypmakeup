import React from "react";
import { UserContext } from "../context/UserContext";
import Swal from 'sweetalert2'
export default function BorrarTarjeta({ idtarjeta }) {

    const eliminarTarjeta = async (idtarjeta) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
        });
        swalWithBootstrapButtons.fire({
            title: "¿Seguro que quieres eliminar esta tarjeta?",
            text: "No podras revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Si, eliminar!",
            cancelButtonText: "No, cancelar!",
            reverseButtons: true
        }).then(async(result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`http://192.168.1.4:5000/api/tarjetas/borrar/${idtarjeta}`, {
                        method: "DELETE",
                        credentials: "include", // 👈 importante para enviar cookies
                        headers: {
                            "Content-Type": "application/json"
                        },
                    });
                    if (res.ok) {
                        Swal.fire({
                            title: "¡Eliminada!",
                            text: "Tarjeta eliminada",
                            icon: "success"
                        });
                        window.location.reload();
                    }
                    if (!res.ok) throw new Error("Error al eliminar tarjeta");

                } catch (err) {
                    console.error(err);
                    Swal.fire({
                        icon: "info",
                        title: "No se pudo eliminar la tarjeta ❌"
                    });
                }

            } else if (
                /* Read more about handling dismissals below */
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire({
                    title: "Cancelado",
                    text: "La tarjeta está a salvo :)",
                    icon: "error"
                });
                return;
            }
        });
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
