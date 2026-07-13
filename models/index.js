const sequelize = require("../config/database");
const Usuarios = require("./Usuarios");
const Kits = require("./Kits");
const Productos = require("./Productos");
const Clientes = require("./Clientes");
const ClienteMovimientos = require("./ClienteMovimientos");
const Proveedores = require("./Proveedores");
const ProveedorPedidos = require("./ProveedorPedidos");
const Cajas = require("./Cajas");
const CajaMovimientos = require("./CajaMovimientos");
const Ventas = require("./Ventas");
const VentasItems = require("./VentasItems");

// Associations

// Kits & Productos
Kits.hasMany(Productos, { as: "productos", foreignKey: "kit_id", onDelete: "SET NULL" });
Productos.belongsTo(Kits, { as: "kit", foreignKey: "kit_id" });

// Cajas & CajaMovimientos
Cajas.hasMany(CajaMovimientos, { as: "movements", foreignKey: "caja_id", onDelete: "CASCADE" });
CajaMovimientos.belongsTo(Cajas, { as: "caja", foreignKey: "caja_id" });

// Cajas & Ventas
Cajas.hasMany(Ventas, { as: "ventas", foreignKey: "caja_id", onDelete: "RESTRICT" });
Ventas.belongsTo(Cajas, { as: "caja", foreignKey: "caja_id" });

// Clientes & Ventas
Clientes.hasMany(Ventas, { as: "ventas", foreignKey: "cliente_id", onDelete: "SET NULL" });
Ventas.belongsTo(Clientes, { as: "cliente", foreignKey: "cliente_id" });

// Clientes & ClienteMovimientos
Clientes.hasMany(ClienteMovimientos, { as: "movements", foreignKey: "cliente_id", onDelete: "CASCADE" });
ClienteMovimientos.belongsTo(Clientes, { as: "cliente", foreignKey: "cliente_id" });

// Proveedores & ProveedorPedidos
Proveedores.hasMany(ProveedorPedidos, { as: "pedidos", foreignKey: "proveedor_id", onDelete: "CASCADE" });
ProveedorPedidos.belongsTo(Proveedores, { as: "proveedor", foreignKey: "proveedor_id" });

// Ventas & VentasItems
Ventas.hasMany(VentasItems, { as: "items", foreignKey: "venta_id", onDelete: "CASCADE" });
VentasItems.belongsTo(Ventas, { as: "venta", foreignKey: "venta_id" });

// Productos & VentasItems
Productos.hasMany(VentasItems, { as: "salesItems", foreignKey: "producto_id", onDelete: "RESTRICT" });
VentasItems.belongsTo(Productos, { as: "producto", foreignKey: "producto_id" });

module.exports = {
    sequelize,
    Usuarios,
    Kits,
    Productos,
    Clientes,
    ClienteMovimientos,
    Proveedores,
    ProveedorPedidos,
    Cajas,
    CajaMovimientos,
    Ventas,
    VentasItems
};
