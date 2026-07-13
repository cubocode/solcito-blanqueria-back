const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ClienteMovimientos = sequelize.define(
    "ClienteMovimientos",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "clientes",
                key: "id",
            },
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        tipo: {
            type: DataTypes.STRING,
            allowNull: false, // 'Compra' or 'Pago/Entrega'
        },
        monto: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        saldo_resultante: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "cliente_movimientos",
        timestamps: false,
    }
);

module.exports = ClienteMovimientos;
