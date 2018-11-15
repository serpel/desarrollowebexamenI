var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')
var app = express();
var sql = require('mssql');
var env = require('dotenv');
var multer = require('multer');
var path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+'.'+getExtension(file.originalname))
    }
})

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

var upload = multer({ storage: storage })

const result = env.config();
app.use(cors());
app.use(bodyParser());

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    debug: true,
    options: {
        encrypt: false
    }
};

app.use(function(err, req, res, next){
    console.error(err);
    res.send({ success: false, message: err })
})

app.listen(8090, function(){ 
    console.log("Server corriendo");
    console.log(config);
    console.log(result);
})

query = (q) => {

    new sql.ConnectionPool(config).connect().then(pool => {
        return pool.query(q)
    })
    .then(result => {
        return result.recordset
    })
    .catch(err => {
        console.error(err);
    })
}

app.get("/search", (req, res, next) => {

    if(!req.query.q){
        res.send("Error, falta parametro de busqueda");
    }

    var q = req.query.q;
    var consulta = `
    SELECT a.*
     FROM [dbo].[Songs] a
          inner join [dbo].[SongGenres] d on d.SongId = a.SongId 
     WHERE d.GenreId in ( select a.GenreId
       from [dbo].[Genres] a 
      where a.GenreName like '%${q}%')`

    new sql.ConnectionPool(config).connect().then(pool => {
        return pool.query(consulta)
    })
    .then(result => {

        var songs = result.recordset;
        var artists = [];

        songs.forEach(element => {

            new sql.ConnectionPool(config).connect().then(pool => {
                return pool.query(`SELECT c.*
                FROM [dbo].[Songs] a
                    inner join [dbo].[SongArtists] b on a.SongId = b.SongId
                    inner join [dbo].[Artists] c on c.ArtitId = b.ArtistId
            where a.SongId = ${element.SongId}`)
            })
            .then(result => {
                artists = result.recordset;

                
                var result = {
                    Songs: songs,
                    Artists: artists 
                }

                res.send(result);
                    })
                });
    })
    .catch(err => {
        console.error(err);
    })

     
})








