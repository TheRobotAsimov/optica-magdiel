const FormField = ({ label, name, error, required, children, icon: Icon }) => {
    return (
        <div className="group">
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                {Icon && <Icon className="h-4 w-4 mr-1.5 text-gray-500" />}
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {error}
                </p>
            )}
        </div>
    );
};

export default FormField;
