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

async function getSingle(input){
      const rows = await db.query(
        `Select id, address, label, code_id, creator, name
        from contracts
        where address like ?`,
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