// Tarjetas.jsx
import React, { useState, useEffect, useContext } from "react";
import CrearTarjeta from "./CrearTarjeta";
import CrearFiltro from "./CrearFiltro";
import CarruselImagenes from "./CarruselImagenes";
import BorrarTarjeta from "./BorrarTarjeta";
import EditarTarjeta from "./EditarTarjeta";
import Filtros from "./Filtros";
import "../styles/CardManager.css";
import { UserContext } from "../context/UserContext";
import "../App.css";
import Swal from 'sweetalert2'

export default function Tarjetas() {
  const { user } = useContext(UserContext);

  const [tarjetas, setTarjetas] = useState([]);
  const [tarjetasFiltradas, setTarjetasFiltradas] = useState([]);
  const [cantidades, setCantidades] = useState({});

  useEffect(() => {
    fetch("http://192.168.1.4:5000/api/tarjetas")
      .then((res) => res.json())
      .then((data) => {
        setTarjetas(data);
        setTarjetasFiltradas(data);
      });
  }, []);

  const handleCantidadChange = (id, value, stock) => {
    let cantidad = parseInt(value) || 0;
    if (cantidad > stock) cantidad = stock;
    setCantidades((prev) => ({ ...prev, [id]: cantidad }));
  };

  const agregarAlCarrito = (tarjeta) => {
    const cantidad = cantidades[tarjeta.idtarjeta] || 0;
    if (cantidad < 1) {
      Swal.fire({
        icon: "error",
        title: "Debe ingresar una cantidad válida",
        text: "(mínimo 1)!",
      }); 
      return;
    }

    const item = {
      id: tarjeta.idtarjeta,
      nombre: tarjeta.nombre,
      precio: tarjeta.precio,
      cantidad,
      total: tarjeta.precio * cantidad,
    };

    const carritoActual = JSON.parse(sessionStorage.getItem("carrito")) || [];
    const existente = carritoActual.find((p) => p.id === item.id);
    if (existente) {
      existente.cantidad += cantidad;
      existente.total = existente.precio * existente.cantidad;
    } else {
      carritoActual.push(item);
    }

    sessionStorage.setItem("carrito", JSON.stringify(carritoActual));
    Swal.fire({
      title: "Listo!",
      text: "agregado al carrito",
      icon: "success"
    });
  };

  return (
    <div>
      {user && (
        <div className="card2">
          <CrearTarjeta onTarjetaCreada={(nueva) => setTarjetas([nueva, ...tarjetas])} />
          <CrearFiltro onFiltroCreado={() => { }} />
        </div>
      )}

      <Filtros tarjetas={tarjetas} setTarjetasFiltradas={setTarjetasFiltradas} />

      <div className="cards">
        {tarjetasFiltradas.map((t) => (
          <section key={t.idtarjeta} className="card">
            <article>
              {user && (
                <>
                  <BorrarTarjeta
                    idtarjeta={t.idtarjeta}
                    onTarjetaBorrada={() =>
                      setTarjetas((prev) => prev.filter((tar) => tar.idtarjeta !== t.idtarjeta))
                    }
                  />
                  <EditarTarjeta
                    tarjeta={t}
                    onTarjetaEditada={(editada) =>
                      setTarjetas((prev) =>
                        prev.map((tar) => (tar.idtarjeta === editada.idtarjeta ? editada : tar))
                      )
                    }
                  />
                </>
              )}
            </article>

            <article className="tarjeta-info">
              <div className="imagenes-container">
                {t.imagenes && t.imagenes.length > 0 ? (
                  <CarruselImagenes imagenes={t.imagenes} nombre={t.nombre} />
                ) : (
                  <p>Sin imágenes</p>
                )}
              </div>
              <h4>{t.nombre}</h4>
              <p>Categoria: {t.categoria}</p>
              <p>💲 {t.precio}</p>
              <p>Stock: {t.stock}</p>
              <input
                type="number"
                min="1"
                max={t.stock}
                value={cantidades[t.idtarjeta] || ""}
                onChange={(e) =>
                  handleCantidadChange(t.idtarjeta, e.target.value, t.stock)
                }
                className="input-cant-carrito"
                placeholder="Cantidad"
              />
              <input
                type="button"
                value="Agregar al carrito"
                className="boton-agregar"
                onClick={() => agregarAlCarrito(t)}
              />
            </article>
          </section>
        ))}
      </div>
    </div>
  );
}
