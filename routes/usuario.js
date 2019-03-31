var express = require('express');
var bcrypt = require('bcryptjs');
//var jwt = require('jsonwebtoken');
var mdAuth = require('../middlewares/autentificacion');

var app = express();

var Usuario = require('../models/usuario');

// ====================================================
// Obtener todos los usuarios
//=====================================================

app.get('/', (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'ERROR- CARGANDO USUARIOS',
                    errors: err
                });
            }
            Usuario.count({}, (err, contar) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Usuarios',
                    usuarios: users,
                    total: contar
                });
            });


        });

    /*res.status(200).json({
        ok: true,
        mensaje: 'Get de usuarios'
    });*/

});

// ====================================================
// Actualizar el usuario con PUT
//=====================================================
app.put('/:id', [mdAuth.verificaToken, mdAuth.verificaPerfil_o_ADMIN], (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR- AL BUSCAR EL USUARIO',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- EL USUARIO NO EXISTE',
                errors: { message: 'No hay usuario con el id: ' + id }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR- AL ACTUALIZAR EL USUARIO',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});


// ====================================================
// Crear un nuevo usuario con verificación de TOKEN
//=====================================================
/*
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- AL CREAR USUARIO',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});*/

// ====================================================
// Crear un nuevo usuario SIN verificación de TOKEN
//=====================================================
app.post('/', (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role,
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- AL CREAR USUARIO',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});

// ====================================================
// Eliminar el usuario con DELETE
//=====================================================
app.delete('/:id', [mdAuth.verificaToken, mdAuth.verificaAdmin], (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR- AL BORRAR EL USUARIO',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- NO EXISTE EL USUARIO',
                errors: { message: 'ERROR- NO EXISTE EL USUARIO CON EL ID ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;
