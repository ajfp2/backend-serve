var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//===============================================================
//Busqueda por Coleccion/Tabla
//===============================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var buscar = req.params.busqueda;
    var reg = new RegExp(buscar, 'i');
    var promesa = null;
    switch (tabla) {
        case 'hospitales':
            promesa = buscarHospitales(reg);
            break;
        case 'medicos':
            promesa = buscarMedicos(reg);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(reg);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- NO EXISTE LA COLECCION A BUSCAR',
                error: { message: 'Tabla/colección no válida.' }
            });
    }
    promesa.then((data) => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });


});

//===============================================================
//Busqueda General
//===============================================================
app.get('/todo/:busqueda', (req, res) => {
    var buscar = req.params.busqueda;
    var reg = new RegExp(buscar, 'i');

    Promise.all([buscarHospitales(reg), buscarMedicos(reg), buscarUsuarios(reg)]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });

});

function buscarHospitales(reg) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: reg })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('ERROR- AL BUSCAR HOSPITALES', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(reg) {
    return new Promise((resolve, reject) => {
        Medico.find()
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec({ nombre: reg }, (err, medicos) => {
                if (err) {
                    reject('ERROR- AL BUSCAR MEDICOS', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(reg) {
    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role').or([{ 'nombre': reg }, { 'email': reg }])
            .exec((err, users) => {
                if (err) reject('ERROR- AL BUSCAR USUARIOS', err);
                else resolve(users);
            });
    });
}

module.exports = app;