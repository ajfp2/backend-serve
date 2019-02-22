var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// ====================================================
// Verificar el TOKEN
//=====================================================
exports.verificaToken22 = function(req, res, next) {
    var token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'ERROR- TOKEN INVALIDO',
                errors: err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();


    });

}