import React from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { Link } from 'react-router';

const ListActions = ({
    searchTerm,
    onSearchChange,
    placeholder = "Buscar...",
    newItemLabel,
    newItemLink,
    onApplyFilter
}) => {
    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
                {/* Search Group */}
                <div className="flex items-center gap-4 flex-1 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-200 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                        />
                    </div>
                    {onApplyFilter && (
                        <button
                            onClick={onApplyFilter}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Aplicar filtro
                        </button>
                    )}
                </div>

                {/* New Item Button */}
                {newItemLink && (
                    <div className="flex gap-3">
                        <Link
                            to={newItemLink}
                            className="flex items-center space-x-2 px-8 py-2 bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-700 hover:to-purple-900 disabled:from-purple-300 disabled:to-purple-400 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                        >
                            <PlusCircle className="h-5 w-5" />
                            <span>{newItemLabel}</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListActions;
