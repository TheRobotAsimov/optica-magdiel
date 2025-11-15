
import React, { useState } from 'react';
import { getDbDump, restoreDb } from '../../service/databaseService';
import NavComponent from '../common/NavBar';

const DatabaseAdmin = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleDownload = async () => {
        try {
            setError('');
            setMessage('Generando backup...');
            const blob = await getDbDump();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `backup-optica-magdiel-${timestamp}.sql`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            setMessage('Backup descargado exitosamente.');
        } catch (err) {
            console.error('Error al descargar el backup:', err);
            setError('Error al descargar el backup. Verifique la consola para más detalles.');
            setMessage('');
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleRestore = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Por favor, seleccione un archivo .sql para restaurar.');
            return;
        }

        try {
            setError('');
            setMessage('Restaurando base de datos...');
            const result = await restoreDb(file);
            setMessage(result.message);
            setFile(null);
            e.target.reset();
        } catch (err) {
            console.error('Error al restaurar la base de datos:', err);
            setError(err.response?.data?.message || 'Error al restaurar la base de datos.');
            setMessage('');
        }
    };

    return (
    <div className="min-h-screen bg-gray-50">

            <NavComponent />
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-blue-700 m-7 ">ADMINISTRACIÓN DE BASE DE DATOS</h1>
            
            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sección de Backup */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-3">Copia de Seguridad (Backup)</h2>
                    <p className="mb-4 text-gray-600">Descargue un archivo .sql con el contenido actual de la base de datos.</p>
                    <button
                        onClick={handleDownload}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Descargar Backup
                    </button>
                </div>

                {/* Sección de Restauración */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-3">Restaurar Base de Datos</h2>
                    <p className="mb-4 text-gray-600">Seleccione un archivo .sql para restaurar la base de datos. Esta acción sobreescribirá los datos actuales.</p>
                    <form onSubmit={handleRestore}>
                        <div className="mb-4">
                            <input 
                                type="file" 
                                accept=".sql" 
                                onChange={handleFileChange} 
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!file}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                        >
                            Restaurar desde Archivo
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    );
};

export default DatabaseAdmin;
