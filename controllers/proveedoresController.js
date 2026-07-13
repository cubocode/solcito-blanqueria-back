const { Proveedores, ProveedorPedidos } = require("../models");

const ProveedoresController = {
    // GET /api/proveedores
    async getAll(req, res) {
        try {
            const list = await Proveedores.findAll({
                include: [
                    { association: "pedidos" }
                ],
                order: [
                    ["nombre", "ASC"],
                    ["pedidos", "fecha_pedido", "DESC"]
                ]
            });
            res.json(list);
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
            res.status(500).json({ error: "Error al obtener proveedores" });
        }
    },

    // POST /api/proveedores
    async create(req, res) {
        try {
            const { nombre, telefono, email, direccion, notas } = req.body;
            if (!nombre) {
                return res.status(400).json({ error: "El nombre es requerido." });
            }
            const nuevo = await Proveedores.create({
                nombre,
                telefono,
                email,
                direccion,
                notas
            });
            res.status(201).json(nuevo);
        } catch (error) {
            console.error("Error al crear proveedor:", error);
            res.status(500).json({ error: "Error al registrar el proveedor" });
        }
    },

    // PUT /api/proveedores/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const parsedId = parseInt(String(id).replace("SUP-", ""), 10);
            if (isNaN(parsedId)) {
                return res.status(400).json({ error: "ID de proveedor inválido." });
            }
            const { nombre, telefono, email, direccion, notas } = req.body;
            const prov = await Proveedores.findByPk(parsedId);
            if (!prov) {
                return res.status(404).json({ error: "Proveedor no encontrado." });
            }
            await prov.update({
                nombre: nombre || prov.nombre,
                telefono,
                email,
                direccion,
                notas
            });
            res.json(prov);
        } catch (error) {
            console.error("Error al actualizar proveedor:", error);
            res.status(500).json({ error: "Error al actualizar el proveedor" });
        }
    },

    // DELETE /api/proveedores/:id
    async remove(req, res) {
        try {
            const { id } = req.params;
            const parsedId = parseInt(String(id).replace("SUP-", ""), 10);
            if (isNaN(parsedId)) {
                return res.status(400).json({ error: "ID de proveedor inválido." });
            }
            const prov = await Proveedores.findByPk(parsedId);
            if (!prov) {
                return res.status(404).json({ error: "Proveedor no encontrado." });
            }
            await prov.destroy();
            res.status(204).send();
        } catch (error) {
            console.error("Error al eliminar proveedor:", error);
            res.status(500).json({ error: "Error al eliminar el proveedor" });
        }
    },

    // POST /api/proveedores/:id/pedidos (Registrar pedido)
    async addOrder(req, res) {
        try {
            const { id } = req.params;
            const parsedId = parseInt(String(id).replace("SUP-", ""), 10);
            if (isNaN(parsedId)) {
                return res.status(400).json({ error: "ID de proveedor inválido." });
            }
            const { monto, detalle, fecha_pedido, estado, fecha_recepcion } = req.body;

            const prov = await Proveedores.findByPk(parsedId);
            if (!prov) {
                return res.status(404).json({ error: "Proveedor no encontrado." });
            }

            const parsedMonto = parseFloat(monto);
            if (isNaN(parsedMonto) || parsedMonto < 0) {
                return res.status(400).json({ error: "El monto debe ser un número válido mayor o igual a cero." });
            }

            const pedido = await ProveedorPedidos.create({
                proveedor_id: prov.id,
                fecha_pedido: fecha_pedido || new Date(),
                fecha_recepcion: estado === "Recibido" ? (fecha_recepcion || new Date()) : null,
                monto: parsedMonto,
                estado: estado || "Pendiente",
                detalle
            });

            res.status(201).json(pedido);
        } catch (error) {
            console.error("Error al registrar pedido de proveedor:", error);
            res.status(500).json({ error: "Error al registrar el pedido" });
        }
    },

    // PUT /api/proveedores/:id/pedidos/:orderId (Actualizar pedido, ej. marcar como recibido)
    async updateOrder(req, res) {
        try {
            const { orderId } = req.params;
            const parsedOrderId = parseInt(String(orderId), 10);
            if (isNaN(parsedOrderId)) {
                return res.status(400).json({ error: "ID de pedido inválido." });
            }
            const { estado, fecha_recepcion, monto, detalle } = req.body;

            const order = await ProveedorPedidos.findByPk(parsedOrderId);
            if (!order) {
                return res.status(404).json({ error: "Pedido no encontrado." });
            }

            const updates = {};
            if (estado) {
                updates.estado = estado;
                if (estado === "Recibido") {
                    updates.fecha_recepcion = fecha_recepcion || new Date();
                } else {
                    updates.fecha_recepcion = null;
                }
            }
            if (monto !== undefined) {
                updates.monto = parseFloat(monto) || 0;
            }
            if (detalle !== undefined) {
                updates.detalle = detalle;
            }

            await order.update(updates);
            res.json(order);
        } catch (error) {
            console.error("Error al actualizar pedido de proveedor:", error);
            res.status(500).json({ error: "Error al actualizar el pedido" });
        }
    }
};

module.exports = ProveedoresController;
