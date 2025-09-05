const db = require('../config/db');

const Client = {
  getAll: (callback) => {
    db.query('SELECT * FROM cliente', callback);
  },
  getById: (id, callback) => {
    db.query('SELECT * FROM cliente WHERE idcliente = ?', [id], callback);
  },
  create: (data, callback) => {
    db.query('INSERT INTO cliente SET ?', [data], callback);
  },
  update: (id, data, callback) => {
    db.query('UPDATE cliente SET ? WHERE idcliente = ?', [data, id], callback);
  },
  delete: (id, callback) => {
    db.query('DELETE FROM cliente WHERE idcliente = ?', [id], callback);
  }
};

module.exports = Client;
