const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport')

//importar variables

require("dotenv").config({ path: "variables.env" });

//Helpers con funciones

const helpers = require('./helpers');

//Crear la conexión a la base de datos

const db = require('./config/db');


//importar el modelo
require('./models/Proyectos')
require('./models/Tareas')
require('./models/Usuarios')


//crear una aplicación express
db.sync()
.then(() => console.log('Conectado al Servidor'))
.catch(error => console.log(error));
const app = express();


// donde cargar los archivos estáticos

app.use(express.static('public')); // te permite cargar los archivos que estén (en este caso) dentro de la carpeta puiblic.

//habilitar pug
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: true}));
//añadir la carpeta de las vistas
app.set('views', path.join(__dirname, './views'))

//agregar flash messages

app.use(flash());

app.use(cookieParser());

// sessiones nos permite navegar en distintas paginas sin volvernos a autenticar
app.use(session({
    secret: 'supersecreto',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session())

//Pasar vardump a la aplicación

app.use((req, res, next) => {
    
    res.locals.vardump = helpers.vardump;
    res.locals.mensajes = req.flash();
    res.locals.usuario = {...req.user} || null;
   
    next() 
})

//Habilitar body parser para leer datos del formulario


app.use('/', routes())


// Servidor y puerto

const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 3000;


app.listen(port, host, ()=>{
    console.log('El servidor está funcionando');
})

