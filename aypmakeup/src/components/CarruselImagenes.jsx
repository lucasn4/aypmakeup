import React, { useState } from "react";
import "../styles/Carrusel.css";

export default function CarruselImagenes({ imagenes, nombre }) {
  const [index, setIndex] = useState(0);

  const prev = () => {
    setIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const next = () => {
    setIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="carrusel">
      <button className="carrusel-btn izq" onClick={prev}>◀</button>
      <img
        src={imagenes[index]}
        alt={`${nombre} ${index + 1}`}
        className="tarjeta-img"
      />
      <button className="carrusel-btn der" onClick={next}>▶</button>
    </div>
  );
}
