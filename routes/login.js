var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');


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
        var token = jwt.sign({ user: userBD }, SEED, { expiresIn: 14400 }); //4 horas

        res.status(201).json({
            ok: true,
            usuario: userBD,
            token: token,
            id: userBD.id
        });
    });
});

module.exports = app;