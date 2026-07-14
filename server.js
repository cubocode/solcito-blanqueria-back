require("dotenv").config();

const sequelize = require("./config/database");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();


// Inicializa asociaciones Sequelize (hasMany/belongsTo) para que los `include`
// funcionen correctamente en controladores.
require("./models/index");

// Rutas

const usuariosRoutes = require("./routes/usuariosRoutes");
const authRoutes = require("./routes/authRoutes");
const productosRoutes = require("./routes/productosRoutes");
const clientesRoutes = require("./routes/clientesRoutes");
const cajaRoutes = require("./routes/cajaRoutes");
const ventasRoutes = require("./routes/ventasRoutes");
const proveedoresRoutes = require("./routes/proveedoresRoutes");

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://192.168.1.71:3000",
            "http://localhost:3002",
            "https://solcito.cubocode.com.ar",
            "https://solcito.cubocode.com.ar/",
        ],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json({ limit: "25mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Mount API routes

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/cajas", cajaRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/proveedores", proveedoresRoutes);


const PORT = process.env.PORT || 3001;

(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Conectado a PostgreSQL (Sequelize)");

        // Sincronizar y verificar/crear usuario administrador por defecto
        const Usuarios = require("./models/Usuarios");
        const count = await Usuarios.count();
        if (count === 0) {
            await Usuarios.create({
                nombre: "Admin",
                apellido: "Concepcion",
                usuario: "admin",
                dni: "12345678",
                contrasenia: "admin",
                nivel: 2,
                contrasenia_temporal: false
            });
            console.log("ℹ️ Usuario administrador por defecto creado (admin / admin)");
        }



        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error al conectar a PostgreSQL", error);
        process.exit(1); // corta el proceso
    }
})();
