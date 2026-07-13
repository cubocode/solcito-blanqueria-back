const express = require("express");
const UsuariosController = require("../controllers/usuariosController");

const router = express.Router();

router.get("/", UsuariosController.getAll);
router.get("/:id", UsuariosController.getById);
router.post("/", UsuariosController.create);
router.put("/:id", UsuariosController.update);
router.delete("/:id", UsuariosController.remove);

module.exports = router;
