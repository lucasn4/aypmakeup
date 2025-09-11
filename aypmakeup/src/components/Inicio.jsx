import React, { useState } from 'react';
import Header from "./Header"; // tu Header sin Tailwind
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import Tarjetas from "./Tarjetas";
import { LuShoppingCart } from "react-icons/lu";
import Carrito from "./Carrito";

function Inicio() {
    const links = [
        { label: "Inicio", href: "/" },
        { label: "Carrito", href: "/carrito" }
    ];
    console.log(localStorage.getItem("token"));
    const navigate = useNavigate();
    const [showCarrito, setShowCarrito] = useState(false);

    return (
        <>
            <Header
                brand="A&P Makeup"
                links={links}
                cta={{ label: "Ingresar" }}
                onClick={() => navigate("/login")}
            />

            <main className="app">
                <section className="hero">
                    <h1>Bienvenido a A&P Makeup</h1>
                    <p>Realiza tu compra agregando productos al carrito y enviando el pedido junto con tus datos, y nuestro personal se contactará con usted.</p>
                    <div className="hero-actions">
                    </div>
                </section>
                <Tarjetas />
            </main>
            {/* Botón flotante */}<button
                className="floating-btn"
                onClick={() => setShowCarrito(true)}
            >
                <LuShoppingCart />
            </button>

            {showCarrito && (
                <Carrito onClose={() => setShowCarrito(false)} />
            )}
        </>
    )
}

export default Inicio