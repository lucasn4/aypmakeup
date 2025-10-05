import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// Generadores de tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id_admin, telefono: user.telefono_admin },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // access token corto
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id_admin },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // refresh token más largo
  );
};
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
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const [rows] = await pool.query(
      "SELECT * FROM Administradores WHERE telefono_admin = ?",
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
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    // guardamos refresh token en DB
    await pool.query("UPDATE Administradores SET refresh_token = ? WHERE id_admin = ?", [refreshToken, user.id_admin]);

    // cookies seguras
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: false, // 🔒 en producción (HTTPS) → true
      sameSite: "lax", // si usas diferentes dominios: "none"
      path: "/", // ✅ asegura que esté disponible en todas las rutas
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login exitoso",
      user: {
        id: user.id_admin,
        nombre: user.nombre_admin,
        apellido: user.apellido_admin,
        telefono: user.telefono_admin,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

// REFRESH
export const refresh = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ error: "No hay refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const [rows] = await pool.query("SELECT * FROM administradores WHERE id_admin = ?", [decoded.id]);
    if (rows.length === 0 || rows[0].refresh_token !== refreshToken) {
      return res.status(403).json({ error: "Refresh token inválido" });
    }

    const newAccessToken = generateAccessToken(rows[0]);

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Access token renovado" });
  } catch (err) {
    return res.status(403).json({ error: "Token inválido" });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await pool.query("UPDATE administradores SET refresh_token = NULL WHERE id_admin = ?", [decoded.id]);
    } catch { }
  }

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.json({ message: "Logout exitoso" });
};

// PERFIL /auth/me
export const me = async (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query("SELECT id_admin, nombre_admin, apellido_admin, telefono_admin FROM Administradores WHERE id_admin = ?", [decoded.id]);

    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ user: rows[0] });
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};