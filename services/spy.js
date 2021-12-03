const db = require('./db');
const pool = require('./db');
const helper = require('../helper');
const config = require('../config');
const app = require('../index');
var request = require('request');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `Select id, address, symbol, decimals, creator, name, image, coingecko_id, label as contract_label
    from contracts
    where symbol like '%SPY%'
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

module.exports = {
  getMultiple
}