import React, { useEffect, useState } from 'react';
import BuildingService from '../../Services/User/BuildingService';
import { useNavigate, Link } from 'react-router-dom';
import { FaCamera, FaMapMarkerAlt, FaRegHeart } from 'react-icons/fa';

const BuildingHome = () => {
    const [buildings, setBuildings] = useState([]);
    const [visibleBuildings, setVisibleBuildings] = useState(4);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = () => {
        BuildingService.getBuildings()
            .then(data => setBuildings(data))
            .catch(error => console.error('Error fetching Buildings:', error));
    };

    const handleLoadMore = () => {
        setVisibleBuildings(prev => prev + 4);
    };

    const handleViewMore = () => {
        navigate('/Buildings');
    };

    return (
        <div>
            <div
                className="grid gap-6"
                style={{
                    gridTemplateColumns: `repeat(${buildings.length === 3 ? 3 : 4}, minmax(0, 1fr))`
                }}
            >
                {buildings.slice(0, visibleBuildings).map((building) => {
                    let images;
                    try {
                        images = JSON.parse(building.image);
                    } catch (error) {
                        images = building.image;
                    }
                    const imageCount = Array.isArray(images) ? images.length : 1;
                    const firstImage = Array.isArray(images) ? images[0] : images;

                    return (
                        <Link key={building.buildingId} to={`/Buildings/${building.buildingId}`} className="block">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden h-[400px] flex flex-col">
                                {building.image && building.image !== '' && (
                                    <div className="w-full h-52">
                                        <img
                                            src={firstImage}
                                            alt={building.title}
                                            className="w-full h-full object-cover rounded-lg cursor-pointer"
                                        />
                                    </div>
                                )}
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{building.buildingName}</h3>

                                    <p className="text-gray-600 mb-2 flex items-center">
                                        <FaMapMarkerAlt className="mr-1" /> {building.location}
                                    </p>
                                    <div className="mt-auto flex justify-between items-center border-t pt-2">
                                        <span className="text-gray-600">
                                            <FaRegHeart />
                                        </span>
                                        <span className="text-gray-600 flex items-center">
                                            <FaCamera className="mr-1" /> {imageCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Nút Xem thêm hoặc Xem tiếp */}
            {visibleBuildings < buildings.length && (
                <div className="flex justify-center mt-6">
                    {visibleBuildings < 16 ? (
                        <button
                            onClick={handleLoadMore}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Xem thêm
                        </button>
                    ) : (
                        <button
                            onClick={handleViewMore}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Xem tiếp
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BuildingHome;
