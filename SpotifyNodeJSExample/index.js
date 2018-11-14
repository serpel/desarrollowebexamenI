var express = require('express')
var sql = require('mssql')

var app = express()

const config = {
    user: 'sa',
    password: 'Admin123',
    database: 'Spotify',
    port: 1433,
    debug: true,
    options: {
        encrypt: false
    }
}

const pool = new sql.ConnectionPool(config, err => {
    console.error(err);
})

app.listen(8090, function(){ 
    console.log("Server corriendo");
    console.log(config);
})

query = (sql) => {
    new pool.connect().then(p => {
        return p.query(sql)
    })
    .then(result => {
        
    })
    .catch(err => {

    })
}

app.get("/search", (req, res, next) => {

})








