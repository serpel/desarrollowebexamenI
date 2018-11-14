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



//Las estudiantes pueden ver todas las clases a las que se encuentran matricul
app.get("/student/:studentId/classes", (req, res, next) => {
    var studentId = req.params.studentId;

    var classes = query(`select * from dbo.StudentClasses where StudentId = ${studentId}`)

    var result = {
        success: true,
        classes: classes,
    }

    res.send(result);
})

//El administrador puede crear nuevos estudiantes, 
app.post("/student/create", upload.single('file'), function(req, res, next) {
    var name = req.body.name;
    var image = '';

    if(!name && !req.file){

        var result = {
            err: "Se requiren los parametros nombre y archivo"
        }
        res.send(result);
    }

    query(`insert into dbo.Students(Name, ImageUrl) values('${name}', '${image}')`)

    var result = {
        message: "Se ingreso el alumno"
    }

    res.send(result);
})

//Los Maestros pueden ver los alumnos que están matriculados en una clase. +5
app.get("/student/classes/:classId", (req, res, next) => {
    var classId = req.params.classId;

    var students = query(`select b.* from StudentClasses a inner join Students b on a.StudentId = b.StudentId where a.ClassId = ${classId} `)

    var result = {
        sucess: true,
        students: students
    }
    res.send(result);
})

//Los Maestros pueden marcar asistencia de un alumnos a una clase en particular, 
app.post("/student/:studentId/assistance/:classId/:date", (req, res, next) => {
    var classId = req.params.classId;
    var studentId = req.params.studentId;
    var date = req.params.date;

    query(`insert into dbo.StudentClasses(StudentId, ClassId, RecordDate) values('${studentId}', '${classId}', '${date}')`)

    var result = {
        message: "Se ingreso la asistencia"
    }
    res.send(result);
})

//Los maestros solo pueden ver las clases a las que se encuentran asignados. 
app.get("/teacher/:teacherId/classes", (req, res, next) => {
    var teacherId = req.params.teacherId;

    var classes = query(`select b.* from TeacherClasses a inner join Classes b on a.ClassId = b.ClassId where a.TeacherId = ${teacherId} `)

    var result = {
        success: true,
        classes: classes
    }
    res.send(result);
})