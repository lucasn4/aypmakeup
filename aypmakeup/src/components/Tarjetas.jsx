import React, { useEffect, useState, useContext } from "react";
import CrearTarjeta from "./CrearTarjeta";
import CrearFiltro from "./CrearFiltro";
import CarruselImagenes from "./CarruselImagenes";
import BorrarTarjeta from "./BorrarTarjeta";
import EditarTarjeta from "./EditarTarjeta";
import "../styles/CardManager.css";
import { UserContext } from "../context/UserContext";
import "../App.css";

export default function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState(null);
  const { user } = useContext(UserContext);

  const [cantidades, setCantidades] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  // 👉 nuevo estado para buscador
  const [busqueda, setBusqueda] = useState("");
  const [resultadoBusqueda, setResultadoBusqueda] = useState([]);


  useEffect(() => {
    fetch("http://192.168.1.4:5000/api/tarjetas")
      .then((res) => res.json())
      .then((data) => {
        setTarjetas(data);
        setResultadoBusqueda(data); // inicializa con todas
      });

    fetch("http://192.168.1.4:5000/api/filtros")
      .then((res) => res.json())
      .then(setFiltros);
  }, []);

  const handleNuevaTarjeta = (nueva) => {
    setTarjetas((prev) => [nueva, ...prev]);
  };

  const handleNuevoFiltro = (nuevo) => {
    setFiltros((prev) => [nuevo, ...prev]);
  };

  const handleCantidadChange = (id, value, stock) => {
    let cantidad = parseInt(value) || 0;

    if (cantidad > stock) {
      cantidad = stock; // 👈 si pasa el límite, lo ajusta al stock
    }

    setCantidades((prev) => ({ ...prev, [id]: cantidad }));
  };

  const agregarAlCarrito = (tarjeta) => {
    const cantidad = cantidades[tarjeta.idtarjeta] || 0;
    if (cantidad < 1) {
      alert("Debe ingresar una cantidad válida (mínimo 1)");
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
    alert(`${tarjeta.nombre} agregado al carrito ✅`);
  };

  // 👉 borrar filtro (solo admin)
  const eliminarFiltro = async (idfiltro) => {
    if (!window.confirm("¿Seguro que quieres eliminar este filtro?")) return;

    try {
      const res = await fetch(`http://192.168.1.4:5000/api/filtros/${idfiltro}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // token del login
        },
      });

      if (!res.ok) throw new Error("Error al eliminar filtro");

      setFiltros((prev) => prev.filter((f) => f.idfiltro !== idfiltro));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el filtro ❌");
    }
  };

  // 👉 editar filtro (solo admin)
  const editarFiltro = async (filtro) => {
    const nuevoNombre = prompt("Nuevo nombre del filtro:", filtro.nombre);
    if (!nuevoNombre || nuevoNombre.trim() === "") return;

    try {
      const res = await fetch(`http://192.168.1.4:5000/api/filtros/${filtro.idfiltro}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ nombre: nuevoNombre }),
      });

      if (!res.ok) throw new Error("Error al editar filtro");

      setFiltros((prev) =>
        prev.map((f) =>
          f.idfiltro === filtro.idfiltro ? { ...f, nombre: nuevoNombre } : f
        )
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo editar el filtro ❌");
    }
  };

  // 👉 función para ejecutar la búsqueda
  const buscarTarjetas = () => {
    if (busqueda.trim() === "") {
      setResultadoBusqueda(tarjetas); // muestra todo si está vacío
      return;
    }

    const filtradas = tarjetas.filter((t) =>
      t.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    setResultadoBusqueda(filtradas);
  };

  // 👉 aplicamos filtro por categoría encima del resultado del buscador
  const tarjetasFiltradas = filtroActivo
    ? resultadoBusqueda.filter(
      (t) => t.categoria.toLowerCase() === filtroActivo.toLowerCase()
    )
    : resultadoBusqueda;

  return (
    <div>
      {user && (
        <div className="card2">
          <CrearTarjeta onTarjetaCreada={handleNuevaTarjeta} />
          <CrearFiltro onFiltroCreado={handleNuevoFiltro} />
        </div>
      )}
      <div className="buscador-container">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-buscador"
        />
        <button onClick={buscarTarjetas} className="btn-buscar">🔍</button>
      </div>

      <div className="filtros-container">
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <div className={`filtros ${menuOpen ? "open" : ""}`}>
          <button
            className={!filtroActivo ? "activo" : ""}
            onClick={() => setFiltroActivo(null)}
          >
            Todos
          </button>
          {filtros.map((f) => (
            <div key={f.idfiltro} className="filtro-item">
              <button
                className={filtroActivo === f.nombre ? "activo" : ""}
                onClick={() => setFiltroActivo(f.nombre)}
              >
                {f.nombre}
              </button>
              {user && (
                <>
                  <button onClick={() => editarFiltro(f)}>✏️</button>
                  <button onClick={() => eliminarFiltro(f.idfiltro)}>🗑️</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="cards">
        {tarjetasFiltradas.map((t) => (
          <section key={t.idtarjeta} className="card">
            <article >
              {user && (
                <>
                  <BorrarTarjeta idtarjeta={t.idtarjeta} />
                  <EditarTarjeta
                    tarjeta={t}
                    onTarjetaEditada={(editada) =>
                      setTarjetas((prev) =>
                        prev.map((tar) =>
                          tar.idtarjeta === editada.idtarjeta ? editada : tar
                        )
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
                onChange={(e) => handleCantidadChange(t.idtarjeta, e.target.value, t.stock)}
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
