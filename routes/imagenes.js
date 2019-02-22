var express = require('express');
var app = express();
const path = require('path');
const fs = require('fs');

//Rutas
app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImg = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    //Si existe el fichero la elimina
    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        var pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }

});

module.exports = app;