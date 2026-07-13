const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Productos = sequelize.define(
    "Productos",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        codigo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        categoria: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        precio_costo: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        precio_venta: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        umbral: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
        },
        kit_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "kits",
                key: "id",
            },
        },
    },
    {
        tableName: "productos",
        timestamps: false,
    }
);

module.exports = Productos;
