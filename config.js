const env = process.env;

const config = {
  db: { /* don't expose password or any sensitive info, done only for demo */
    host: env.DB_HOST || '192.168.1.30',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || 'localpassword',
    database: env.DB_NAME || 'scrt_contracts',
    connectionLimit : 10
  },
  listPerPage: env.LIST_PER_PAGE || 25,
};


module.exports = config;
