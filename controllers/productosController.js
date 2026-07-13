const { Op } = require("sequelize");
const { sequelize, Productos, Kits } = require("../models");

const ProductosController = {
    // GET /api/productos
    async getAll(req, res) {
        try {
            const { q } = req.query;
            let whereClause = {};
            if (q && q.trim() !== "") {
                const search = q.trim().toLowerCase();
                whereClause = {
                    [Op.or]: [
                        sequelize.where(sequelize.fn("lower", sequelize.col("Productos.nombre")), {
                            [Op.like]: `%${search}%`
                        }),
                        sequelize.where(sequelize.fn("lower", sequelize.col("Productos.codigo")), {
                            [Op.like]: `%${search}%`
                        })
                    ]
                };
            }

            const list = await Productos.findAll({
                where: whereClause,
                include: [{ model: Kits, as: "kit" }]
            });
            res.json(list);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            res.status(500).json({ error: "Error al obtener los productos" });
        }
    },

    // GET /api/productos/:id
    async getById(req, res) {
        try {
            const { id } = req.params;
            const prod = await Productos.findByPk(id, {
                include: [{ model: Kits, as: "kit" }]
            });
            if (!prod) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }
            res.json(prod);
        } catch (error) {
            console.error("Error al obtener producto:", error);
            res.status(500).json({ error: "Error al obtener el producto" });
        }
    },

    // POST /api/productos
    async create(req, res) {
        const t = await sequelize.transaction();
        try {
            const { codigo, nombre, categoria, descripcion, precio_costo, precio_venta, cantidad, umbral, kit_nombre } = req.body;

            if (!codigo || !nombre || !categoria || precio_costo === undefined || precio_venta === undefined) {
                await t.rollback();
                return res.status(400).json({ error: "Código, nombre, categoría, costo y precio de venta son requeridos." });
            }

            let kit_id = null;
            if (kit_nombre && kit_nombre.trim() !== "") {
                const [kit] = await Kits.findOrCreate({
                    where: { nombre: kit_nombre.trim() },
                    transaction: t
                });
                kit_id = kit.id;
            }

            // Create product record
            const prod = await Productos.create(
                {
                    codigo,
                    nombre,
                    categoria,
                    descripcion,
                    precio_costo: parseFloat(precio_costo) || 0,
                    precio_venta: parseFloat(precio_venta) || 0,
                    cantidad: parseInt(cantidad, 10) || 0,
                    umbral: parseInt(umbral, 10) || 0,
                    kit_id
                },
                { transaction: t }
            );

            await t.commit();

            // Return created product with kit details
            const result = await Productos.findByPk(prod.id, {
                include: [{ model: Kits, as: "kit" }]
            });
            res.status(201).json(result);
        } catch (error) {
            await t.rollback();
            console.error("Error al crear producto:", error);
            res.status(400).json({ error: "Error al crear el producto. Código duplicado u otro error." });
        }
    },

    // PUT /api/productos/:id
    async update(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { codigo, nombre, categoria, descripcion, precio_costo, precio_venta, cantidad, umbral, kit_nombre } = req.body;

            const prod = await Productos.findByPk(id, { transaction: t });
            if (!prod) {
                await t.rollback();
                return res.status(404).json({ error: "Producto no encontrado." });
            }

            let kit_id = null;
            if (kit_nombre && kit_nombre.trim() !== "") {
                const [kit] = await Kits.findOrCreate({
                    where: { nombre: kit_nombre.trim() },
                    transaction: t
                });
                kit_id = kit.id;
            }

            // Update product record
            await prod.update(
                {
                    codigo,
                    nombre,
                    categoria,
                    descripcion,
                    precio_costo: parseFloat(precio_costo) || 0,
                    precio_venta: parseFloat(precio_venta) || 0,
                    cantidad: parseInt(cantidad, 10) || 0,
                    umbral: parseInt(umbral, 10) || 0,
                    kit_id
                },
                { transaction: t }
            );

            await t.commit();

            const result = await Productos.findByPk(id, {
                include: [{ model: Kits, as: "kit" }]
            });
            res.json(result);
        } catch (error) {
            await t.rollback();
            console.error("Error al actualizar producto:", error);
            res.status(400).json({ error: "Error al actualizar el producto." });
        }
    },

    // DELETE /api/productos/:id
    async remove(req, res) {
        try {
            const { id } = req.params;
            const prod = await Productos.findByPk(id);
            if (!prod) {
                return res.status(404).json({ error: "Producto no encontrado." });
            }

            await prod.destroy();
            res.status(204).send();
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            res.status(500).json({ error: "Error al eliminar el producto." });
        }
    }
};

module.exports = ProductosController;
