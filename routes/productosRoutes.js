const express = require("express");
const ProductosController = require("../controllers/productosController");

const router = express.Router();

// Define product endpoints
router.get("/", ProductosController.getAll);
router.get("/:id", ProductosController.getById);
router.post("/", ProductosController.create);
router.put("/:id", ProductosController.update);
router.delete("/:id", ProductosController.remove);

module.exports = router;
