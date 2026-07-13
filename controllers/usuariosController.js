const Usuarios = require("../models/Usuarios");

const UsuariosController = {
    // GET /api/usuarios
    async getAll(req, res) {
        try {
            const usuarios = await Usuarios.findAll();
            res.json(usuarios);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            res.status(500).json({ error: "Error al obtener usuarios" });
        }
    },

    // GET /api/usuarios/:id
    async getById(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuarios.findByPk(id);
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(usuario);
        } catch (error) {
            console.error("Error al obtener usuario:", error);
            res.status(500).json({ error: "Error al obtener usuario" });
        }
    },

    // POST /api/usuarios
    async create(req, res) {
        try {
            const nuevo = await Usuarios.create(req.body);
            res.status(201).json(nuevo);
        } catch (error) {
            console.error("Error al crear usuario:", error);
            res.status(400).json({ error: "Error al crear usuario" });
        }
    },

    // PUT /api/usuarios/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuarios.findByPk(id);
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            await usuario.update(req.body);
            res.json(usuario);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            res.status(400).json({ error: "Error al actualizar usuario" });
        }
    },

    // DELETE /api/usuarios/:id
    async remove(req, res) {
        try {
            const { id } = req.params;
            const usuario = await Usuarios.findByPk(id);
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            await usuario.destroy();
            res.status(204).send();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            res.status(500).json({ error: "Error al eliminar usuario" });
        }
    },
};

module.exports = UsuariosController;

