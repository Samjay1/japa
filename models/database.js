const mysql = require('mysql');


    let connection = mysql.createPool({
        connectionLimit : 2, 
        host: 'localhost',
        user: 'root',
        database: 'gigdb',
        charset: 'utf8mb4...'
    })

    connection.getConnection(function(error, pool){
        if(error) return console.log('error : ', error.message);
        console.log('Connected to the Mysql database')
        pool.release();
    })
 
   module.exports = connection;