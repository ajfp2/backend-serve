var express = require('express');
var mdAuth = require('../middlewares/autentificacion');

var app = express();

var Hospital = require('../models/hospital');

// ====================================================
// Obtener un Hospital por id
//=====================================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                  });
            }
            if (!hospital) {
                return res.status(400).json({
                  ok: false,
                  mensaje: 'El hospital con el id ' + id + 'no existe',
                  errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
              ok: true,
              hospital: hospital
            });
        });
  });


// ====================================================
// Obtener todos los Hospitales
//=====================================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitals) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'ERROR- CARGANDO HOSPITALES',
                    errors: err
                });
            }
            Hospital.count({}, (err, contar) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Hospitales',
                    hospitales: hospitals,
                    total: contar
                });
            });
        });

});

// ====================================================
// Crear un nuevo Hospital
//=====================================================
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;
    var hpt = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });
    hpt.save((err, hospitalSave) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- AL CREAR EL HOSPITAL',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalSave
        });
    });

});

// ====================================================
// Actualizar el Hospital con PUT
//=====================================================
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR- AL BUSCAR EL HOSPITAL',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- EL HOSPITAL NO EXISTE',
                errors: { message: 'No hay hospitales con el id: ' + id }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalSave) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'ERROR- AL ACTUALIZAR EL HOSPITAL',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalSave
            });
        });
    });
});

// ====================================================
// Eliminar el Hospital con DELETE
//=====================================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'ERROR- AL BORRAR EL HOSPITAL',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'ERROR- NO EXISTE EL HOSPITAL',
                errors: { message: 'ERROR- NO EXISTE EL HOSPITAL CON EL ID ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
        });
    });
});


module.exports = app;
