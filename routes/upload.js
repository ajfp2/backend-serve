var express = require('express');
var app = express();
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuarios = require('../models/usuario');
var Hospitales = require('../models/hospital');
var Medicos = require('../models/medico');


// default options
app.use(fileUpload());



app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion validos
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'ERROR- COLECCIÓN NO VALIDA',
            errors: { message: 'La imagen no se puede asignar a ninguna colección' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'ERROR- AL SUBIR EL FICHERO',
            errors: { message: 'Debe subir una imagen' }
        });
    }
    var file = req.files.imagen;
    var partesNombre = file.name.split('.');
    var extensionFile = partesNombre[partesNombre.length - 1];
    //Extensiones permitidas
    var extPermitidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extPermitidas.indexOf(extensionFile) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'ERROR- LA EXTENSIÓN NO ES VALIDO',
            errors: { message: 'Las extenisones validas son:' + extPermitidas.join(',') }
        });
    }

    //Nombre archivo personalizado
    var nameFile = `${ id }-${ new Date().getMilliseconds() }.${ extensionFile }`;
    //Mover el file del Temp a nuestra ruta del servidor
    var path = `./uploads/${ tipo }/${ nameFile }`;

    file.mv(path, err => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'ERROR- AL MOVER EL ARCHIVO',
                errors: err
            });
        }
        subirPorTipo(tipo, id, nameFile, res);
        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'OK- FILE MOVE',
        //     dato: extensionFile
        // });

    });

});

function subirPorTipo(tipo, id, nomArc, res) {

    if (tipo === 'usuarios') {
        Usuarios.findById(id, (err, usuario) => {
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR- EL USUARIO NO EXISTE',
                    errors: { message: 'El usario no existe' }
                });
            }

            var pathOld = './uploads/usuarios/' + usuario.img;
            //Si existe el fichero la elimina
            if (fs.existsSync(pathOld)) {
                try {
                    fs.unlink(pathOld, function(exc) {
                        if (exc) throw exc;
                        //console.log('File deleted!');
                    });
                } catch (exc) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'ERROR- AL ELIMINAR EL ARCHIVO VIEJO',
                        errors: { message: exc.toString() }
                    });
                }
            }

            usuario.img = nomArc;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'OK- IMAGEN DEL USUARIO ACUTLAIZADO',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medicos.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR- EL MEDICO NO EXISTE',
                    errors: { message: 'El medico no existe' }
                });
            }
            var pathOld = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathOld)) {
                try {
                    fs.unlink(pathOld, function(exc) {
                        if (exc) throw exc;
                        //console.log('File deleted!');
                    });
                } catch (exc) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'ERROR- AL ELIMINAR EL ARCHIVO VIEJO',
                        errors: { message: exc.toString() }
                    });
                }
            }


            medico.img = nomArc;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'OK- IMAGEN DEL MEDICO ACUTLAIZADA',
                    medico: medicoActualizado
                });
            });
        });
    }

    if (tipo === 'hospitales') {
        Hospitales.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR- EL HOSPITAL NO EXISTE',
                    errors: { message: 'El hospital no existe' }
                });
            }

            var pathOld = './uploads/hospitales/' + hospital.img;
            if (fs.existsSync(pathOld)) {
                try {
                    fs.unlink(pathOld, function(exc) {
                        if (exc) throw exc;
                        //console.log('File deleted!');
                    });
                } catch (exc) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'ERROR- AL ELIMINAR EL ARCHIVO VIEJO',
                        errors: { message: exc.toString() }
                    });
                }
            }

            hospital.img = nomArc;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'OK- IMAGEN DEL HOSPITAL ACUTLAIZADA',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

/*
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));
*/

module.exports = app;
