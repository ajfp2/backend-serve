var express = require('express');
var mdAuth = require('../middlewares/autentificacion');

var app = express();

var Medico = require('../models/medico');

// ====================================================
// Obtener todos los Medicos del Hospital
//=====================================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({}, 'nombre img')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'ERROR- CARGANDO MEDICOS',
                    errors: err
                });
            }

            Medico.count({}, (err, contar) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'GET- Obtener médicos',
                    medicos: medicos,
                    total: contar
                });
            });
        });
});
// ====================================================
// Obtener un Médico con ID
//=====================================================
app.get('/:id', (req, res) => {

  var id = req.params.id;
  var body = req.body;

    Medico.findById(id)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'ERROR- OBTENIENDO EL MEDICO',
                    errors: err
                });
            }

            if(!medico){
              return res.status(400).json({
                  ok: false,
                  mensaje: 'ERROR- OBTENIENDO EL MEDICO',
                  errors: { message: 'No existe un medico con ese ID'}
              });
            }

            res.status(200).json({
                ok: true,
                medico: medico,
            });
        });
});

// ====================================================
// Crear un nuevo Médico
//=====================================================
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;
    var md = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    md.save((err, medicoSave) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- AL CREAR EL MEDICO',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoSave,
        });
    });

});

// ====================================================
// Actualizar el Hospital con PUT
//=====================================================
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR- AL BUSCAR EL MEDICO',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- EL MEDICO NO EXISTE',
                errors: { message: 'No hay medicos con el id: ' + id }
            });
        }

        medico.nombre = body.nombre;
        //medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoSave) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR- AL ACTUALIZAR EL MEDICO',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoSave
            });
        });
    });
});

// ====================================================
// Eliminar el Medico con DELETE
//=====================================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR- AL BORRAR EL MEDICO',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- NO EXISTE EL MEDICO',
                errors: { message: 'ERROR- NO EXISTE EL MEDICO CON EL ID ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: medicoBorrado
        });
    });
});

module.exports = app;
