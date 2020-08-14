const passport = require("passport");

const Usuarios = require("../models/Usuarios");
const crypto = require("crypto");
const bcrypt = require('bcrypt-nodejs')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos campos son obligatorios",
});

//funcion para revisar si el usuario está logueado o no

exports.usuarioAutenticado = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/iniciar-sesion");
};

// función para cerrar sesion

exports.cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/iniciar-sesion");
  });
};

// genera un token si el usuario es válido

exports.enviarToken = async (req, res) => {
  // verificar que el usuario existe
  const { email } = req.body;
  const usuario = await Usuarios.findOne({ where: { email } });

  //Si no existe el usuario

  if (!usuario) {
    req.flash("error", "No existe esa cuenta");
    res.redirect("/reestablecer");
  }

  // usuario existe

  usuario.token = crypto.randomBytes(20).toString("hex");
  usuario.expiracion = Date.now() + 3600000;

  // guardarlos en la bse de datos

  await usuario.save();

  //url de reset

  const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

  //envía el correo con el token

  await enviarEmail.enviar({

    usuario,
    subject: 'Password Reset',
    resetUrl,
    archivo: 'reestablecer-password'
  })
// terminar la ejecución
req.flash('correcto', 'Se envió un mensaje a tu correo')
res.redirect('/iniciar-sesion')
  
};

exports.validarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token,
    },
  });

  // si no encuentra el usuario
  if (!usuario) {
    req.flash("error", "No Válido");
    res.redirect("/reestablecer");
  }

  // formulario para generar el password

  res.render("resetPassword", {
    nombrePagina: "Reestablecer Contraseña",
  });
};

//cambia el password por uno nuevo

exports.actualizarPassword = async (req, res) => {

    //verifica el token válido pero también la fecha de expiración
  const usuario = await Usuarios.findOne({
    where: {
         token: req.params.token,
         expiracion: {
            [Op.gte] : Date.now()

         }
         }
  });

  // verificamos si el usuario existe

  if(!usuario) {
      req.flash('error', 'No Válido')
      res.redirect('/reestablecer')
  }



  // hashear el nuevo password


  usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
  usuario.token = null;
  usuario.expiracion = null;


// guardamos el nuevo password

await usuario.save()
req.flash('correcto', 'Tu password se ha modificado correctamente')
res.redirect('/iniciar-sesion');









};
