import React from 'react';

const ListBadge = ({ text, type = 'default' }) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    const typeMap = {
        danger: "bg-red-100 text-red-800",
        success: "bg-green-100 text-green-800",
        info: "bg-blue-100 text-blue-800",
        warning: "bg-yellow-100 text-yellow-800",
        default: "bg-gray-100 text-gray-800"
    };

    const badgeClass = typeMap[type] || typeMap.default;

    return (
        <span className={`${baseClasses} ${badgeClass}`}>
            {text}
        </span>
    );
};

export default ListBadge;
