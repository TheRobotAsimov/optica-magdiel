import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export const useListManager = (service, deleteMethodName, idFieldName) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async (fetchMethodName) => {
        setLoading(true);
        try {
            const data = await service[fetchMethodName]();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, deleteConfig = {}) => {
        const {
            title = '¿Estás seguro?',
            text = "¡No podrás revertir esto!",
            successTitle = '¡Eliminado!',
            successText = 'El registro ha sido eliminado.',
            errorTitle = '¡Error!',
            errorText = 'No se pudo eliminar el registro.'
        } = deleteConfig;

        Swal.fire({
            title,
            text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '¡Sí, bórralo!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await service[deleteMethodName](id);
                    setItems(items.filter((item) => item[idFieldName] !== id));
                    Swal.fire(successTitle, successText, 'success');
                } catch {
                    Swal.fire(errorTitle, errorText, 'error');
                }
            }
        });
    };

    return {
        items,
        setItems,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        fetchData,
        handleDelete
    };
};
