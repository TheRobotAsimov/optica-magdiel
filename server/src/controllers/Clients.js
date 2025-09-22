import Client from '../models/Client.js';

export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.getAll();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.getById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const insertId = await Client.create(req.body);
    res.status(201).json({ message: 'Client created successfully', id: insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const affectedRows = await Client.update(req.params.id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json({ message: 'Client updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const affectedRows = await Client.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
