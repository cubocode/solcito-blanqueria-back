const { sequelize, Clientes, Cajas, CajaMovimientos } = require("../models");

const ClientesController = {
    // GET /api/clientes
    async getAll(req, res) {
        try {
            const list = await Clientes.findAll({
                include: [
                    { association: "movements" }
                ],
                order: [
                    ["nombre", "ASC"],
                    ["movements", "fecha", "ASC"]
                ]
            });
            res.json(list);
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            res.status(500).json({ error: "Error al obtener los clientes" });
        }
    },

    // POST /api/clientes
    async create(req, res) {
        try {
            const { nombre, telefono, limite_credito } = req.body;
            if (!nombre) {
                return res.status(400).json({ error: "El nombre es requerido." });
            }
            const newClient = await Clientes.create({
                nombre,
                telefono,
                limite_credito: parseFloat(limite_credito) || 50000,
                saldo: 0,
                estado: "Activo"
            });
            res.status(201).json(newClient);
        } catch (error) {
            console.error("Error al crear cliente:", error);
            res.status(500).json({ error: "Error al crear el cliente" });
        }
    },

    // POST /api/clientes/:id/movimientos (Cobro / Repay debt)
    async addMovement(req, res) {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { monto, concepto, metodo_pago } = req.body;

            const client = await Clientes.findByPk(id, { transaction: t });
            if (!client) {
                await t.rollback();
                return res.status(404).json({ error: "Cliente no encontrado." });
            }

            const parsedMonto = parseFloat(monto);
            if (isNaN(parsedMonto) || parsedMonto <= 0) {
                await t.rollback();
                return res.status(400).json({ error: "Monto inválido." });
            }

            // Find active cash session
            const activeCaja = await Cajas.findOne({
                where: { estado: "Abierto" },
                transaction: t
            });
            if (!activeCaja) {
                await t.rollback();
                return res.status(400).json({ error: "Debe abrir la caja para poder registrar cobros." });
            }

            // Update client balance (reduce debt)
            const oldBalance = parseFloat(client.saldo);
            const newBalance = Math.max(0, oldBalance - parsedMonto);
            await client.update({ saldo: newBalance }, { transaction: t });

            // Create client ledger entry
            const ClienteMovimientos = require("../models/ClienteMovimientos");
            await ClienteMovimientos.create(
                {
                    cliente_id: client.id,
                    tipo: "Pago/Entrega",
                    monto: parsedMonto,
                    saldo_resultante: newBalance,
                    descripcion: concepto || `Pago/Entrega (${metodo_pago || "Efectivo"})`
                },
                { transaction: t }
            );

            // Create cash shift movement
            await CajaMovimientos.create(
                {
                    caja_id: activeCaja.id,
                    tipo: "Cobro",
                    monto: parsedMonto,
                    concepto: `Cobro Cta Cte: ${client.nombre}${concepto ? ` - ${concepto}` : ""}`,
                    metodo_pago: metodo_pago || "Efectivo"
                },
                { transaction: t }
            );

            await t.commit();
            res.json({ success: true, newBalance });
        } catch (error) {
            await t.rollback();
            console.error("Error al registrar movimiento de cliente:", error);
            res.status(500).json({ error: "Error al procesar el pago." });
        }
    },

    // PUT /api/clientes/:id/status
    async changeStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            if (!estado || !["Activo", "Suspendido"].includes(estado)) {
                return res.status(400).json({ error: "Estado inválido." });
            }
            const client = await Clientes.findByPk(id);
            if (!client) {
                return res.status(404).json({ error: "Cliente no encontrado." });
            }
            await client.update({ estado });
            res.json(client);
        } catch (error) {
            console.error("Error al cambiar estado de cliente:", error);
            res.status(500).json({ error: "Error al cambiar estado" });
        }
    },

    // PUT /api/clientes/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, telefono, limite_credito } = req.body;
            const client = await Clientes.findByPk(id);
            if (!client) {
                return res.status(404).json({ error: "Cliente no encontrado." });
            }
            await client.update({
                nombre: nombre.trim(),
                telefono: telefono ? telefono.trim() : null,
                limite_credito: parseFloat(limite_credito) || client.limite_credito
            });
            res.json(client);
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            res.status(500).json({ error: "Error al actualizar el cliente" });
        }
    }
};

module.exports = ClientesController;
