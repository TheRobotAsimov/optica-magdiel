import React from 'react';

const ListHeader = ({ title, subtitle }) => {
    return (
        <div className="bg-white rounded-4xl shadow-xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-400 to-indigo-800 px-8 py-6">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white text-center uppercase">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-blue-100 text-sm mt-1 text-center">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListHeader;
