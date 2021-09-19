const db = require('./db');
const pool = require('./db');
const helper = require('../helper');
const config = require('../config');
const app = require('../index');
var request = require('request');

async function getMultiple(page = 1){
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `Select s.id as api_id, REPLACE(coalesce(c.name, c.label), 'SecretSwap--', '') as name, c.address as swapContract,
    (SELECT address from contracts where id = s.tokenContract) as tokenAddress,
    (SELECT spyAddress from contracts where id = s.tokenContract) as spyAddress,
    (SELECT coalesce(c.symbol ,c.name, c.label) from contracts c where c.id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1)) as asset1,
    (SELECT decimals from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1)) as asset1decimals,
    (SELECT address from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1)) as asset1address,
    (SELECT coingecko_id from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1)) as asset1cgid,
    (SELECT coalesce(c.symbol ,c.name, c.label) from contracts c where c.id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1, 1)) as asset2,
    (SELECT decimals from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1, 1)) as asset2decimals,
    (SELECT address from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1, 1)) as asset2address,
    (SELECT coingecko_id from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1, 1)) as asset2cgid
    from swaps as s
    LEFT JOIN contracts as c
    on s.contract = c.id
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

async function getSingle(input, input2="x" ){
  var i1length = input.replace(/\s+/g, '').length;
  var i2length = input2.replace(/\s+/g, '').length;

  const mainQuery = `
  Select s.id as api_id, REPLACE(coalesce(c.name, c.label), 'SecretSwap--', '') as name, c.address as swapContract,
          (SELECT address from contracts where id = s.tokenContract) as tokenAddress,
          (SELECT spyAddress from contracts where id = s.tokenContract) as spyAddress,
          (SELECT coalesce(c.symbol ,c.name, c.label) from contracts c where c.id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1)) as asset1,
          (SELECT decimals from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1)) as asset1decimals,
          (SELECT address from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1)) as asset1address,
          (SELECT coingecko_id from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1)) as asset1cgid,
          (SELECT coalesce(c.symbol ,c.name, c.label) from contracts c where c.id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1, 1)) as asset2,
          (SELECT decimals from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1, 1)) as asset2decimals,
          (SELECT address from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1, 1)) as asset2address,
          (SELECT coingecko_id from contracts where id = (SELECT p.contractID FROM pairs p WHERE s.id = p.swapID LIMIT 1, 1)) as asset2cgid
          from swaps as s
          LEFT JOIN contracts as c
          on s.contract = c.id `;

  if ((i1length===45 || i1length===5) && (i2length===45 || i2length===5)) {
      var insert1 = "%" + input.replace(/\s+/g, '') + "%";
      var insert2 = "%" + input2.replace(/\s+/g, '') + "%";

      const rows1 = await db.query(
        `SELECT id FROM contracts
        where 
          label like ? AND
          label like ? AND
          snip20 = 0`,
        [insert1,insert2]
      );
      const data1 = helper.emptyOrRows(rows1);

      if ( data1.length === 0 ) {
        var returnEr = {'message': 'unknown_input'};
        return(returnEr);
      } else {
        const rows = await db.query(mainQuery + `where s.contract = ?`, 
          [data1[0].id]
        );
        const data = helper.emptyOrRows(rows);
        return {
          data
        }
      }

  } else if (input.replace(/\s+/g, '').length===45) {
      const rows = await db.query(mainQuery + `where c.address = ?`, 
        [input.replace(/\s+/g, '')]
      );
      const data = helper.emptyOrRows(rows);

      
      request('https://api.coingecko.com/api/v3/simple/price?ids=' + data[0].asset1cgid + '&vs_currencies=USD', function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(JSON.parse(body)); // Print the google web page.

        }
      });
    
      return {
        data
      }

  } else if (!isNaN(parseInt(input.replace(/\s+/g, '')))) {
      const rows = await db.query(mainQuery + `where s.id = ?`, 
        [parseInt(input.replace(/\s+/g, ''))]
      );

      const data = helper.emptyOrRows(rows);      
        return data;


  } else {
      var returnEr = {'message': 'unknown_input'};
      return(returnEr);
  }
}

module.exports = {
  getMultiple,
  getSingle
}