const db = require('./db');
const pool = require('./db');
const helper = require('../helper');
const config = require('../config');
const app = require('../index');
var request = require('request');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `Select id, address, label, code_id, creator, name
    from contracts
    LIMIT ?,?`, 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}

async function getSingle(input, queryJs){
      const rows = await db.query(
        `Select id, address, label, code_id, creator, name
        from contracts
        where address like ?`,
        [input]
      );
      const data = helper.emptyOrRows(rows);

      if (data.length){
        return {
          data
        }
      }

      const res = await queryInfo(input, queryJs);
      console.log(res);
      return {
        data: res
      }
/*
      if ( data.length === 0 ) {
          var returnEr = {'message': 'unknown_input'};
          return(returnEr);
      }
      */


}

async function queryInfo(address, queryJs) {
  const data = await queryJs.getContract(address)
  
  const rows = await db.query(
    `INSERT INTO contracts (code_id, creator, label, address)
    VALUES (?, ?, ?, ?);`,
    [data.codeId, data.creator, data.label, data.address]
  );
  const result = helper.emptyOrRows(rows);
  console.log(result.insertId);

  let snip20;
  try {
    snip20 = await queryJs.queryContractSmart(address, {token_info: {}})
    if (snip20.token_info.decimals) {
      await setSnip20(address, snip20.token_info)
    }
  } catch {
    null;
  }

  return [{
    id: result.insertId,
    address: data.address,
    label: data.label,
    code_id: data.codeId,
    creator: data.creator,
    name: snip20?.token_info?.name || null
  }]

}

async function setSnip20(address, tokenInfo){
  const rows = await db.query(
    `UPDATE contracts SET
      snip20=1,
      decimals=?,
      symbol=?,
      name=?
    WHERE address=?;`,
    [tokenInfo.decimals, tokenInfo.symbol, tokenInfo.name, address]
  );
  const result = helper.emptyOrRows(rows);
  console.log(result);
}

async function getByLabel(input){
  const rows = await db.query(
    `Select id, address, label, code_id, creator, name
    from contracts
    where label like ?`,
    [input]
  );
  const data = helper.emptyOrRows(rows);

  if ( data.length === 0 ) {
      var returnEr = {'message': 'unknown_input'};
      return(returnEr);
  } else {
      return {
        data
      }
  }
}

module.exports = {
  getMultiple,
  getSingle,
  getByLabel
}