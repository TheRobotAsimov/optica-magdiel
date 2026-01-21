import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

/**
 * useFormManager hook to manage form state, validation, and submission.
 * 
 * @param {Object} options
 * @param {Object} options.initialValues - Initial state values for the form.
 * @param {Function} options.validateField - Function to validate a single field (fieldName, value, allValues).
 * @param {Function} options.validateForm - Function to validate the entire form (allValues).
 * @param {Object} options.service - Service object containing API methods.
 * @param {string} options.createMethod - Name of the method to create an entity.
 * @param {string} options.updateMethod - Name of the method to update an entity.
 * @param {string} options.getByIdMethod - Name of the method to fetch an entity by ID.
 * @param {string|number} options.id - The ID of the entity (if in edit mode).
 * @param {string} options.redirectPath - Path to navigate to after success.
 * @param {Function} options.transformData - Optional function to transform data before state update or before submission.
 */
export const useFormManager = ({
    initialValues,
    validateField,
    validateForm,
    service,
    createMethod,
    updateMethod,
    getByIdMethod,
    id,
    redirectPath,
    transformData = (data) => data
}) => {
    const [values, setValues] = useState(initialValues);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const navigate = useNavigate();

    // Load data for edit mode
    useEffect(() => {
        if (id && getByIdMethod && service[getByIdMethod]) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const data = await service[getByIdMethod](id);
                    setValues(transformData(data, 'fetch'));
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id, getByIdMethod, service]);

    // Validation effect
    useEffect(() => {
        if (validateForm) {
            const errors = validateForm(values);
            const hasErrors = Object.values(errors).some((err) => err);
            setIsFormValid(!hasErrors);
        }
    }, [values, validateForm]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const processedValue = type === 'checkbox' ? (checked ? 'Si' : 'No') : value;

        setValues((prev) => ({ ...prev, [name]: processedValue }));

        if (touched[name] && validateField) {
            const error = validateField(name, processedValue, values);
            setFieldErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        if (validateField) {
            const error = validateField(name, value, values);
            setFieldErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (validateForm) {
            const errors = validateForm(values);
            if (Object.values(errors).some(err => err)) {
                setFieldErrors(errors);
                setError('Por favor corrige los errores en el formulario');
                return;
            }
        }

        setLoading(true);
        try {
            const dataToSubmit = transformData(values, 'submit');
            if (id) {
                await service[updateMethod](id, dataToSubmit);
            } else {
                await service[createMethod](dataToSubmit);
            }
            if (redirectPath) {
                navigate(redirectPath);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        values,
        setValues,
        loading,
        setLoading,
        error,
        setError,
        fieldErrors,
        setFieldErrors,
        touched,
        setTouched,
        isFormValid,
        handleChange,
        handleBlur,
        handleSubmit,
        isEdit: !!id
    };
};
