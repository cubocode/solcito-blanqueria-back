const Usuarios = require("../models/Usuarios");

const AuthController = {
    // POST /api/auth/login
    async login(req, res) {
        try {
            const { usuario, contrasenia } = req.body;

            if (!usuario || !contrasenia) {
                return res.status(400).json({ error: "Usuario y contraseña son requeridos." });
            }

            // Search user by username
            const user = await Usuarios.findOne({ where: { usuario } });

            if (!user) {
                return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
            }

            // Verify password (plain text as stored in database)
            if (user.contrasenia !== contrasenia) {
                return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
            }

            // Return user details without password
            res.json({
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                usuario: user.usuario,
                nivel: user.nivel,
                contrasenia_temporal: user.contrasenia_temporal
            });
        } catch (error) {
            console.error("Error en proceso de login:", error);
            res.status(500).json({ error: "Error interno del servidor en el inicio de sesión." });
        }
    }
};

module.exports = AuthController;
