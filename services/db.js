const mysql = require('mysql2/promise');
const config = require('../config');




let pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.HOST,
  user            : process.env.USER,
  password        : process.env.PASSWORD,
  database        : process.env.DATABASE
});

/*
async function pquery(sql, params) {
  pool.getConnection(function(err, connection) {
    if(err) console.log(err);
    console.log(sql);
    console.log(params);
    

    connection.execute(sql, params(function(err, rows, fields) {
      if(err) {
        console.log(err);
      } else {
        console.log("hi");
        return rows;
        connection.release();
      }
    }));
  });
}
*/
 

async function query(sql, params) {
  //const connection = mysql.createConnection(config.db);
  const [results, ] = await pool.execute(sql, params);
  return results;
  //connection.close();
}




module.exports = {
  query,
  //pquery,
  pool
}
