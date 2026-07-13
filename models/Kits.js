const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Kits = sequelize.define(
    "Kits",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        tableName: "kits",
        timestamps: false,
    }
);

module.exports = Kits;
