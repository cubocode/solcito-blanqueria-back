const express = require("express");
const router = express.Router();
const ProveedoresController = require("../controllers/proveedoresController");

router.get("/", ProveedoresController.getAll);
router.post("/", ProveedoresController.create);
router.put("/:id", ProveedoresController.update);
router.delete("/:id", ProveedoresController.remove);

router.post("/:id/pedidos", ProveedoresController.addOrder);
router.put("/:id/pedidos/:orderId", ProveedoresController.updateOrder);

module.exports = router;
