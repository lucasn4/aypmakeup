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
        { label: "Login", href: "/login" }
    ];
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
                    <p>Realiza tu pedido agregando productos al carrito y se enviará por whatsapp para que nuestro personal se comunique con usted.</p>
                    <div className="hero-actions">
                    </div>
                </section>
                <div className="marquee">
                    <div className="marquee-content">
                        <img className="icono" src="../../public/logorecortado32.png" alt="icono" />
                        <span>💄 A&P MAKEUP – Donde tu estilo cobra vida 💋</span>
                    </div>
                </div>
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