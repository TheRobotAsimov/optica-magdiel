const FormSection = ({ title, icon: Icon, children, colorClass = "blue" }) => {
    const accentColors = {
        blue: "from-blue-500 to-indigo-500",
        indigo: "from-indigo-500 to-purple-500",
        purple: "from-purple-500 to-pink-500",
        green: "from-green-500 to-teal-500",
    };

    const bgColors = {
        blue: "from-blue-50 to-indigo-50 border-blue-100",
        indigo: "from-indigo-50 to-purple-50 border-indigo-100",
        purple: "from-purple-50 to-pink-50 border-purple-100",
        green: "from-green-50 to-teal-50 border-green-100",
    };

    const iconColors = {
        blue: "bg-blue-600",
        indigo: "bg-indigo-600",
        purple: "bg-purple-600",
        green: "bg-green-600",
    };

    return (
        <div className="relative">
            <div className={`absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b ${accentColors[colorClass] || accentColors.blue} rounded-full`}></div>
            <div className={`bg-gradient-to-br ${bgColors[colorClass] || bgColors.blue} rounded-xl p-8 border`}>
                <div className="flex items-center space-x-3 mb-6">
                    <div className={`${iconColors[colorClass] || iconColors.blue} p-2 rounded-lg`}>
                        {Icon && <Icon className="h-5 w-5 text-white" />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FormSection;
