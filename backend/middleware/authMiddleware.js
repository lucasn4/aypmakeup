import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Tomamos token de cookie segura
  const token = req.cookies.access_token;

  if (!token) return res.status(403).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // guardamos info del usuario (id, rol, etc)
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
