var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

//Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =========================================================
// Autentificación con Google
// =========================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: true,
                mensaje: 'Token NO valido!'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR- AL BUSCAR USUARIO',
                errors: err
            });
        }

        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'ERROR- Debe de utilizar la autentificación normal!'
                });
            } else {
                //userBD.password = ':)';
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); //4 horas

                res.status(201).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id,
                    menu: obtenerMenu(usuarioBD.role)
                });
            }
        } else {
            //No existe usuario.... hay que CREARLO.
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((erro, usuarioBD) => {
                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); //4 horas

                res.status(201).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD._id,
                    menu: obtenerMenu(usuarioBD.role)
                });
            });
        }

    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'OK!!',
    //     googleUser: googleUser
    // });
});

// =========================================================
// Autentificación normal
// =========================================================

app.post('/', (req, res) => {

    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, userBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR- AL BUSCAR USUARIO',
                errors: err
            });
        }

        if (!userBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- LOGIN INCORRECTO - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, userBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- LOGIN INCORRECTO - password',
                errors: err
            });
        }

        //CREAR TOKEN ********
        userBD.password = ':)';
        var token = jwt.sign({ usuario: userBD }, SEED, { expiresIn: 14400 }); //4 horas

        res.status(201).json({
            ok: true,
            usuario: userBD,
            token: token,
            id: userBD._id,
            menu: obtenerMenu(userBD.role)
        });
    });
});

function obtenerMenu(role) {
  var menu = [
    {
      titulo: 'Principal',
      icono: ' mdi mdi-gauge',
      submenu: [
        { titulo: 'Dashboard', url: '/dashboard' },
        { titulo: 'Progress Bar', url: '/progress' },
        { titulo: 'Gráficas', url: '/graficas1' },
        { titulo: 'Promesas', url: '/promesas' },
        { titulo: 'RXJS', url: '/rxjs' }
      ]
    },
    {
      titulo: 'Mantenimiento',
      icono: ' mdi mdi-folder-lock-open',
      submenu: [
        //{ titulo: 'Usuarios', url: '/usuarios' },
        { titulo: 'Hospitales', url: '/hospitales' },
        { titulo: 'Médicos', url: '/medicos' }
      ]
    }
  ];
  if( role === 'ADMIN_ROLE') {
    menu[1].submenu.unshift( { titulo: 'Usuarios', url: '/usuarios' } );
  }
  return menu;
}

module.exports = app;
