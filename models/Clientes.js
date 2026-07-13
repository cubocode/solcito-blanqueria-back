const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Clientes = sequelize.define(
    "Clientes",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        limite_credito: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 50000,
        },
        saldo: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Activo",
        },
    },
    {
        tableName: "clientes",
        timestamps: false,
    }
);

module.exports = Clientes;
