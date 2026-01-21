import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

const FormHeader = ({ title, subtitle, icon: Icon, backPath }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                            {Icon && <Icon className="h-8 w-8 text-white" />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{title}</h1>
                            {subtitle && <p className="text-blue-100 text-sm mt-1">{subtitle}</p>}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(backPath)}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormHeader;
