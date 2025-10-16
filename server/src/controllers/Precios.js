import fs from 'fs/promises';
import path from 'path';

const dataPath = path.resolve(process.cwd(), 'src/data/priceCatalog.json');

export const getPriceCatalog = async (req, res) => {
  try {
    const rawData = await fs.readFile(dataPath, 'utf-8');
    const priceCatalog = JSON.parse(rawData);
    res.status(200).json(priceCatalog);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el catálogo de precios', error });
  }
};

export const updatePriceCatalog = async (req, res) => {
  try {
    const updatedCatalog = req.body;
    console.log('req.body', req.body)
    await fs.writeFile(dataPath, JSON.stringify(updatedCatalog, null, 2), 'utf-8');
    res.status(200).json({ message: 'Catálogo de precios actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el catálogo de precios', error });
  }
};