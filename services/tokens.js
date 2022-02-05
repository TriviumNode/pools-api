
const db = require('./db');
const pool = require('./db');
const helper = require('../helper');
const config = require('../config');
const app = require('../index');
var request = require('request');
const { queryInfo } = require('./secret.js')


async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `Select id, address, symbol, decimals, creator, name, image, coingecko_id, label as contract_label
    from contracts
    where snip20 = 1
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
    `Select id, address, symbol, decimals, creator, name, image, coingecko_id, label as contract_label
    from contracts
    where address like ?`,
    [input]
  );
  const data = helper.emptyOrRows(rows);
  console.log(data[0]);
  if (data.length && data[0].symbol){
    return {
      data
    }
  } else if (data.length) {
    throw("not a token")
  } else {
    const res = await queryInfo(input, queryJs, true);
    console.log(res);
    return {
      data: res
    }
  }



}

/*
async function getSingle(input){
      const rows = await db.query(
        `Select id, address, symbol, decimals, creator, name, image, coingecko_id, label as contract_label
        from contracts
        where snip20 = 1
        and address like ?`,
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

*/

async function getBySymbol(input){
  const rows = await db.query(
    `Select id, address, symbol, decimals, creator, name, image, coingecko_id, label as contract_label
    from contracts
    where snip20 = 1
    and symbol collate utf8mb4_unicode_ci like ?`,
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
  getBySymbol
}