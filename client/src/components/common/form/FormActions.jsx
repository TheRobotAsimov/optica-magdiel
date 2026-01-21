import { Save } from 'lucide-react';
import { useNavigate } from 'react-router';

const FormActions = ({ onCancel, loading, isFormValid, cancelLabel = "Cancelar", saveLabel, isEdit }) => {
    const navigate = useNavigate();

    const handleCancel = () => {
        if (typeof onCancel === 'string') {
            navigate(onCancel);
        } else if (typeof onCancel === 'function') {
            onCancel();
        }
    };

    const defaultSaveLabel = isEdit ? 'Actualizar' : 'Crear';

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t-2 border-gray-200">
            <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            >
                {cancelLabel}
            </button>
            <button
                type="submit"
                disabled={!isFormValid || loading}
                className="flex items-center justify-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Guardando...' : (saveLabel || defaultSaveLabel)}</span>
            </button>
        </div>
    );
};

export default FormActions;
