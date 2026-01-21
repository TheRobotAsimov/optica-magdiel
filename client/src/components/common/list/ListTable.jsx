import React from 'react';

const ListTable = ({ headers, children }) => {
    return (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                            {headers.map((header, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${header.toLowerCase() === 'acciones' ? 'text-center' : ''
                                        }`}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListTable;
