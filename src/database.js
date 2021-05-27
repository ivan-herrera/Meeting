const mysql = require('mysql')
const { promisify } = require('util')

const { database } = require('./keys')

const pool = mysql.createPool(database)

pool.getConnection((err, connection) =>{
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('Conexion con la BD se perdio')
        }else if(err.code === 'ER_CON_COUNT_ERROR'){
            console.error('DB tiene muchas conexiones')
        }else if(err.code === 'ECONNREFUSED'){
            console.error('Conexion con la BD fue rechazada')
        }
    }

    if(connection) connection.release()
    console.log('DB is Connected')
    return
    
    
})

pool.query = promisify(pool.query)

module.exports = pool