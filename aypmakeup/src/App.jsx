import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import  {UserProvider} from "./context/UserContext";
import Header from "./components/Header";
import Inicio from "./components/Inicio";
import Login from "./components/Login";
import Registro from "./components/Registro";
import Notificaciones from "./components/Notificaciones";
import "./App.css";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;