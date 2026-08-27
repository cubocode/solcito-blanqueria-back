require("dotenv").config();
const { sequelize, Productos } = require("./models");
const VentasController = require("./controllers/ventasController");

// Mock express response and request
const req = {
    body: {
        metodo_pago: "Efectivo",
        total: 180,
        cliente_id: null,
        items: []
    }
};

const res = {
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        console.log("Response Status:", this.statusCode || 200);
        console.log("Response JSON:", JSON.stringify(data, null, 2));
    }
};

async function test() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        // Find MUESTRA-100 products to test with
        const prods = await Productos.findAll({
            where: { codigo: "MUESTRA-100" }
        });
        if (prods.length === 0) {
            console.error("No products with code MUESTRA-100 found!");
            return;
        }
        console.log("Found products:", prods.map(p => ({ id: p.id, codigo: p.codigo, color: p.color })));

        // Find a client to test with
        const { Clientes } = require("./models");
        const client = await Clientes.findOne();
        if (client) {
            console.log("Found client to test with:", { id: client.id, nombre: client.nombre });
            req.body.cliente_id = String(client.id); // Send as string just like frontend option value
        } else {
            console.log("No clients found.");
        }

        req.body.items = prods.map(p => ({
            productId: p.id,
            quantity: 1,
            salePrice: parseFloat(p.precio_venta),
            subtotal: parseFloat(p.precio_venta)
        }));
        req.body.total = prods.reduce((sum, p) => sum + parseFloat(p.precio_venta), 0);

        console.log("Calling VentasController.create...");
        await VentasController.create(req, res);
    } catch (err) {
        console.error("Outer Error:", err);
    } finally {
        await sequelize.close();
    }
}

test();
