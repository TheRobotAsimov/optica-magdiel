import Paciente from '../models/Paciente.js';

// Controlador para la gestión de pacientes

// Método para obtener todos los pacientes
export const getAllPacientes = async (req, res) => {
  try {
    const pacientes = await Paciente.getAll();
    res.json(pacientes);  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Método para obtener un paciente por ID
export const getPacienteById = async (req, res) => {
  try {
    const { id } = req.params;
    const paciente = await Paciente.getById(id);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente not found' });
    }
    res.json(paciente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Método para crear un nuevo paciente
export const createPaciente = async (req, res) => {
  try {
    const pacienteId = await Paciente.create(req.body);
    res.status(201).json({ id: pacienteId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Método para actualizar un paciente
export const updatePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    await Paciente.update(id, req.body);
    res.json({ message: 'Paciente updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Método para eliminar un paciente
export const deletePaciente = async (req, res) => {
  try {
    const { id } = req.params;
    await Paciente.delete(id);
    res.json({ message: 'Paciente deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};