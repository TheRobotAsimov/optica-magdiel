const Client = require('../models/Client');

exports.getAllClients = (req, res) => {
  Client.getAll((err, clients) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(clients);
  });
};

exports.getClientById = (req, res) => {
  Client.getById(req.params.id, (err, client) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!client.length) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client[0]);
  });
};

exports.createClient = (req, res) => {
  const newClient = {
    nombre: req.body.nombre,
    paterno: req.body.paterno,
    materno: req.body.materno,
    fecnac: req.body.fecnac,
    telefono: req.body.telefono,
    domicilio: req.body.domicilio,
    ruta: req.body.ruta,
    sexo: req.body.sexo
  };

  Client.create(newClient, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, ...newClient });
  });
};

exports.updateClient = (req, res) => {
  const clientData = {
    nombre: req.body.nombre,
    paterno: req.body.paterno,
    materno: req.body.materno,
    fecnac: req.body.fecnac,
    telefono: req.body.telefono,
    domicilio: req.body.domicilio,
    ruta: req.body.ruta,
    sexo: req.body.sexo
  };

  Client.update(req.params.id, clientData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ id: req.params.id, ...clientData });
  });
};

exports.deleteClient = (req, res) => {
  Client.delete(req.params.id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(204).send();
  });
};
