const mysql = require('mysql2/promise');
require('dotenv').config();

let pool  = mysql.createPool({
  connectionLimit : 10,
  host            : process.env.DB_HOST,
  port            : process.env.DB_PORT,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASSWORD,
  database        : process.env.DATABASE
});
 

async function query(sql, params) {
  const [results, ] = await pool.execute(sql, params);
  return results;
}

async function createContractsTable() {
    const sql=`CREATE TABLE IF NOT EXISTS contracts (
      id int(6) NOT NULL AUTO_INCREMENT,
      address varchar(45) COLLATE utf8mb4_bin NOT NULL,
      label varchar(160) COLLATE utf8mb4_bin NOT NULL,
      code_id int(6) NOT NULL,
      code_hash VARCHAR(80) NULL DEFAULT NULL,
      creator varchar(45) COLLATE utf8mb4_bin NOT NULL,
      snip20 tinyint(1) NOT NULL DEFAULT '0',
      decimals int(3) NOT NULL DEFAULT '18',
      spyAddress varchar(45) COLLATE utf8mb4_bin DEFAULT NULL,
      symbol varchar(15) COLLATE utf8mb4_bin DEFAULT NULL,
      name varchar(150) COLLATE utf8mb4_bin DEFAULT NULL,
      image varchar(100) COLLATE utf8mb4_bin DEFAULT NULL,
      sourceAddress int(100) DEFAULT NULL,
      coingecko_id varchar(50) COLLATE utf8mb4_bin DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY caddr (address),
      UNIQUE KEY clabel (label)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`
  await query(sql)
}

async function setupDb() {
  createContractsTable();
}



module.exports = {
  query,
  //pquery,
  pool,
  setupDb
}
