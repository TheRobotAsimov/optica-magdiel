
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

export const dumpDatabase = (req, res) => {
  // Asegúrate de que las variables de entorno no sean undefined
  const dbHost = process.env.DB_HOST;
  const dbUser = process.env.DB_USER;
  const dbPass = process.env.DB_PASS;
  const dbName = process.env.DB_NAME;

  // Es una buena práctica manejar contraseñas vacías
  const passwordArg = dbPass ? `--password=${dbPass}` : '';

  const dumpCommand = `mysqldump --host=${dbHost} --user=${dbUser} ${passwordArg} ${dbName}`;

  exec(dumpCommand, (error, stdout, stderr) => {
    // Si el comando falla (ej: mysqldump no encontrado, credenciales incorrectas)
    if (error) {
      console.error(`Error executing mysqldump: ${stderr}`);
      // Solo enviamos una respuesta: el JSON de error.
      return res.status(500).json({ 
        message: 'Error al generar el backup de la base de datos.', 
        error: stderr 
      });
    }

    // Si el comando tiene éxito, procedemos a enviar el archivo.
    const filename = `backup-${Date.now()}.sql`;
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/sql');
    
    // Enviamos el resultado (stdout) como respuesta.
    res.send(stdout);
  });
};

export const restoreDatabase = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se ha subido ningún archivo.' });
  }

  const filePath = req.file.path;
  const restoreCommand = `mysql --host=${DB_HOST} --user=${DB_USER} --password=${DB_PASS} ${DB_NAME} < ${filePath}`;

  exec(restoreCommand, (error, stdout, stderr) => {
    // Clean up the uploaded file
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        console.error(`Error al eliminar el archivo temporal: ${unlinkErr.message}`);
      }
    });

    if (error) {
      console.error(`Error executing mysql restore: ${error.message}`);
      return res.status(500).json({ message: 'Error al restaurar la base de datos.', error: stderr });
    }

    res.status(200).json({ message: 'Base de datos restaurada exitosamente.' });
  });
};
