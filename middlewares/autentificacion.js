var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


// ====================================================
// Verificar el TOKEN
//=====================================================
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
// ====================================================
// Verificar si es ADMIN_ROLE
//=====================================================
exports.verificaAdmin = function(req, res, next) {

    var usuario = req.usuario;
    if( usuario.role === 'ADMIN_ROLE') {
      next();
      return;
    } else {
      return res.status(401).json({
          ok: false,
          mensaje: 'NO ERES ADMINISTRADOR',
          errors: { message: 'ERROR- No puedes hacer esto, debes ser administrador.'}
      });
    }
}

// ====================================================
// Verificar el usuario pueda ACTUALIZAR el PERFIL
//=====================================================
exports.verificaPerfil_o_ADMIN = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;
    if( usuario.role === 'ADMIN_ROLE' || usuario._id === id ) {
      next();
      return;
    } else {
      return res.status(401).json({
          ok: false,
          mensaje: 'NO ERES ADMINISTRADOR ni el el usuario para perfil',
          errors: { message: 'ERROR- No puedes hacer esto, debes ser administrador.'}
      });
    }
}
