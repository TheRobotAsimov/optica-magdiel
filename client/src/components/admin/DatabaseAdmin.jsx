
import { useState } from 'react';
import { getDbDump, restoreDb } from '../../service/databaseService';
import NavComponent from '../common/NavBar';
import { Database, Download, Upload, Shield, AlertTriangle, CheckCircle, XCircle, FileText, Clock } from 'lucide-react';

const DatabaseAdmin = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleDownload = async () => {
        try {
            setError('');
            setMessage('Generando backup...');
            setIsProcessing(true);
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
        } finally {
            setIsProcessing(false);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            <NavComponent />
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="bg-white rounded-4xl shadow-xl overflow-hidden mb-6 ">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-800 px-8 py-6">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                            <Database className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Administración de Base de Datos
                            </h1>
                            <p className="text-blue-100 text-sm mt-1">
                                Gestiona copias de seguridad y restauración de datos
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Alert Messages */}
            {message && (
                <div className="mb-6 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-xl shadow-md">
                        <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                            <p className="text-green-800 font-medium">{message}</p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 animate-in fade-in duration-300">
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-4 rounded-xl shadow-md">
                        <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-red-600 mr-3" />
                            <p className="text-red-800 font-medium">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Backup Section */}
                    <div className="relative">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="bg-blue-600 p-2 rounded-lg">
                                        <Download className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Copia de Seguridad
                                    </h2>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Descargue un archivo .sql con el contenido actual de la base de datos
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                                    <div className="flex items-start space-x-3">
                                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-blue-900 text-sm mb-1">
                                                Información Importante
                                            </p>
                                            <ul className="text-xs text-blue-800 space-y-1">
                                                <li>• El backup incluye toda la estructura y datos</li>
                                                <li>• Se genera un archivo .sql descargable</li>
                                                <li>• Recomendado hacer backups regularmente</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        
                                    </div>

                                    <button
                                        onClick={handleDownload}
                                        disabled={isProcessing}
                                        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                                    >
                                        <Download className="h-5 w-5" />
                                        <span>{isProcessing ? 'Generando...' : 'Descargar Backup'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Restore Section */}
                    <div className="relative">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-full">
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 border-b border-orange-100">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="bg-orange-600 p-2 rounded-lg">
                                        <Upload className="h-5 w-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Restaurar Base de Datos
                                    </h2>
                                </div>
                                <p className="text-gray-600 text-sm">
                                    Seleccione un archivo .sql para restaurar la base de datos
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
                                    <div className="flex items-start space-x-3">
                                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-red-900 text-sm mb-1">
                                                Advertencia
                                            </p>
                                            <ul className="text-xs text-red-800 space-y-1">
                                                <li>• Esta acción sobreescribirá los datos actuales</li>
                                                <li>• No se puede deshacer esta operación</li>
                                                <li>• Asegúrese de usar un backup válido</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleRestore}>
                                    <div className="border-2 border-dashed border-gray-300 mb-5 rounded-xl p-6 hover:border-orange-400 transition-colors">
                                        <input 
                                            type="file" 
                                            accept=".sql" 
                                            onChange={handleFileChange} 
                                            className="block w-full text-sm text-gray-600
                                                file:mr-4 file:py-3 file:px-6
                                                file:rounded-xl file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-gradient-to-r file:from-orange-500 file:to-red-500
                                                file:text-white
                                                hover:file:from-orange-600 hover:file:to-red-600
                                                file:cursor-pointer file:transition-all file:duration-200
                                                file:shadow-md hover:file:shadow-lg
                                                cursor-pointer"
                                        />
                                    </div>
                                    <button 
                                        type='submit'
                                        disabled={!file || isProcessing}
                                        className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                                    >
                                        <Upload className="h-5 w-5" />
                                        <span>{isProcessing ? 'Restaurando...' : 'Restaurar desde Archivo'}</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    </div>
    );
};

export default DatabaseAdmin;
