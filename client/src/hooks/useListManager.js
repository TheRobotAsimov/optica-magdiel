import { useState, useCallback, useEffect } from 'react';
import Swal from 'sweetalert2';

export const useListManager = (service, deleteMethodName, idFieldName, fetchMethodName = null, extraParams = {}) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const extraParamsString = JSON.stringify(extraParams);

    const fetchData = useCallback(async (methodNameOverride = null) => {
        const method = methodNameOverride || fetchMethodName;
        if (!method) return;

        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                search: debouncedSearchTerm,
                ...JSON.parse(extraParamsString)
            };

            const response = await service[method](params);

            if (response && response.items) {
                setItems(response.items);
                setTotalItems(response.totalItems || 0);
                setTotalPages(response.totalPages || 0);
            } else {
                setItems(Array.isArray(response) ? response : []);
                setTotalItems(Array.isArray(response) ? response.length : 0);
                setTotalPages(1);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [service, fetchMethodName, currentPage, itemsPerPage, debouncedSearchTerm, extraParamsString]);

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
                    // Instead of local filter, re-fetch to maintain correct pagination slice
                    fetchData();
                    Swal.fire(successTitle, successText, 'success');
                } catch {
                    Swal.fire(errorTitle, errorText, 'error');
                }
            }
        });
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset to page 1 when search or extraParams changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, extraParamsString]);

    // Auto-fetch when pagination changes
    useEffect(() => {
        if (fetchMethodName) {
            fetchData();
        }
    }, [fetchData, fetchMethodName, currentPage, itemsPerPage, debouncedSearchTerm, extraParamsString]);

    return {
        items,
        setItems,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalItems,
        totalPages,
        fetchData,
        handleDelete
    };
};
