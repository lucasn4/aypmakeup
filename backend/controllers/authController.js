import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// REGISTRO
export const register = async (req, res) => {
    const { nombre, apellido, telefono, contraseña } = req.body;

    try {
        // encriptar contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const [result] = await pool.query(
            "INSERT INTO administradores (nombre_admin, apellido_admin, telefono_admin, contraseña_admin) VALUES (?, ?, ?, ?)",
            [nombre, apellido, telefono, hashedPassword]
        );

        res.json({ message: "Usuario registrado correctamente", id: result.insertId });
    } catch (err) {
        console.error("Error en registro:", err);
        res.status(500).json({ error: "Error al registrar usuario" });
    }
};

// LOGIN
export const login = async (req, res) => {
    const { telefono, contraseña } = req.body; // lo hacemos con telefono como identificador

    try {
        const [rows] = await pool.query(
            "SELECT * FROM administradores WHERE telefono_admin = ?",
            [telefono]
        );

        if (rows.length === 0) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(contraseña, user.contraseña_admin);

        if (!validPassword) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: user.idadmin, telefono: user.telefono_admin },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login exitoso",
            token,
            nombre: user.nombre_admin,
            apellido: user.apellido_admin,
            telefono: user.telefono_admin,
        });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
};
