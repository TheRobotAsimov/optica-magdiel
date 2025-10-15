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