import Client from '../models/Client.js';

// Controlador para la gestión de clientes

// Metodo para obtener todos los clientes
export const getAllClients = async (req, res) => {
  try {
    // Llamar al modelo para obtener todos los clientes
    const clients = await Client.getAll();
    // Enviar la lista de clientes como respuesta JSON
    res.json(clients);
  } catch (err) {
    // Manejo de errores
    res.status(500).json({ error: err.message });
  }
};

// Metodo para obtener un cliente por ID
export const getClientById = async (req, res) => {
  try {
    // Consultar el cliente que coincide con el ID solicitado
    const client = await Client.getById(req.params.id);
    // Si no se encuentra el cliente, enviar un error 404
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    // Enviar el cliente encontrado como respuesta JSON
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Metodo para crear un nuevo cliente
export const createClient = async (req, res) => {
  try {
    const insertId = await Client.create(req.body);
    res.status(201).json({ message: 'Client created successfully', id: insertId });
  } catch (err) {
      console.log(req.body);
      console.log(err);
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

export const searchClients = async (req, res) => {
  try {
    const { nombre, paterno } = req.query;
    const clients = await Client.search(nombre, paterno);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
