const express = require("express");
const router = express.Router();
const ClientesController = require("../controllers/clientesController");

router.get("/", ClientesController.getAll);
router.post("/", ClientesController.create);
router.post("/:id/movimientos", ClientesController.addMovement);
router.put("/:id/status", ClientesController.changeStatus);
router.put("/:id", ClientesController.update);

module.exports = router;
