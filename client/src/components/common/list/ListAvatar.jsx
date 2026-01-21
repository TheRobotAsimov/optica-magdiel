import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ListAvatar = ({ initials, icon: Icon, isWarning = false }) => {
    return (
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md ${isWarning
                ? 'bg-red-500'
                : 'bg-gradient-to-br from-blue-400 to-indigo-500'
            }`}>
            {isWarning ? (
                <AlertTriangle className="h-5 w-5" />
            ) : (
                Icon ? <Icon className="h-5 w-5" /> : initials
            )}
        </div>
    );
};

export default ListAvatar;
