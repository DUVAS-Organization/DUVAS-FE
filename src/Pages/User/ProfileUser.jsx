import React from 'react';

const ProfileUser = () => {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="relative w-1/3 mx-auto">
                    <input
                        className="border w-full border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                        type="text"
                        placeholder="  Search..."
                    />
                </div>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-400 transition duration-200"

                >
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <div

                    className="bg-white border border-gray-300 rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200"
                >


                    <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Location: </span>
                    </p>

                    <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Verify: </span>
                    </p>

                    <div className="flex justify-end space-x-2 mt-4">
                        <button
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-400 transition duration-200"

                        >
                        </button>
                        <button
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-400 transition duration-200"

                        >
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );

};

export default ProfileUser;
