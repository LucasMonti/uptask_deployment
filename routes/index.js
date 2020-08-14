const express = require("express");
const router = express.Router();

//Importar Express Validator
const { body } = require("express-validator");

const proyectosControllers = require("../controllers/proyectosControllers");

const tareasControllers = require("../controllers/tareasController");

const usuariosControllers = require("../controllers/usuariosController");

const authController = require("../controllers/authController");

module.exports = function () {
  router.get(
    "/",

    authController.usuarioAutenticado,
    proyectosControllers.proyectosHome
  );
  router.get(
    "/nuevo-proyecto",
    authController.usuarioAutenticado,
    proyectosControllers.formularioProyecto
  );

  router.post(
    "/nuevo-proyecto",
    authController.usuarioAutenticado,
    body("nombre").not().isEmpty().trim().escape(),
    proyectosControllers.nuevoProyecto
  );
  //Listar Proyecto
  router.get(
    "/proyectos/:url",
    authController.usuarioAutenticado,
    proyectosControllers.proyectoPorUrl
  );

  //Actualizar el Proyecto

  router.get(
    "/proyecto/editar/:id",
    authController.usuarioAutenticado,
    proyectosControllers.formularioEditar
  );

  router.post(
    "/nuevo-proyecto/:id",
    authController.usuarioAutenticado,
    body("nombre").not().isEmpty().trim().escape(),
    proyectosControllers.actualizarProyecto
  );

  //Eliminar proyecto
  router.delete(
    "/proyectos/:url",
    authController.usuarioAutenticado,
    proyectosControllers.eliminarProyecto
  );

  router.post(
    "/proyectos/:url",
    authController.usuarioAutenticado,
    tareasControllers.agregarTarea
  );

  //Actualizar tarea

  router.patch(
    "/tareas/:id",
    authController.usuarioAutenticado,
    tareasControllers.cambiarEstadoTarea
  );

  router.delete(
    "/tareas/:id",
    authController.usuarioAutenticado,
    tareasControllers.eliminarTarea
  );

  router.get("/crear-cuenta", usuariosControllers.formCrearCuenta);
  router.post("/crear-cuenta", usuariosControllers.crearCuenta);
  router.get('/confirmar/:correo', usuariosControllers.confirmarCuenta)

  //Iniciar sesión

  router.get("/iniciar-sesion", usuariosControllers.formIniciarSesion);
  router.post("/iniciar-sesion", authController.autenticarUsuario);

  //cerrar sesion

  router.get('/cerrar-sesion', authController.cerrarSesion);

  //reestablecer contraseña

  router.get('/reestablecer', usuariosControllers.formReestablecerPassword);
  router.post('/reestablecer', authController.enviarToken);
  router.get('/reestablecer/:token', authController.validarToken);
  router.post('/reestablecer/:token', authController.actualizarPassword);
  return router;
};
