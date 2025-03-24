import { useState } from "react";
import { motion } from "framer-motion";

const rooms = [
  {
    id: 1,
    name: "Phòng Deluxe",
    rentDate: "2025-03-10",
    status: "Đang thuê",
    image: "https://res.cloudinary.com/dikbanpzr/image/upload/v1740838529/u4fpaottpjoazywl2oly.jpg",
    price: "5,000,000 VND",
    owner: {
      name: "Nguyễn Văn A",
      image: "https://res.cloudinary.com/dikbanpzr/image/upload/v1741426046/hyixkxndnejsnxv97ait.png",
    },
    expiryDate: "2025-04-10",
  },
  {
    id: 2,
    name: "Phòng Standard",
    rentDate: "2025-02-20",
    status: "Đã hết hạn",
    image: "https://res.cloudinary.com/dikbanpzr/image/upload/v1740838529/u4fpaottpjoazywl2oly.jpg",
    price: "3,500,000 VND",
    owner: {
      name: "Trần Thị B",
      image: "https://res.cloudinary.com/dikbanpzr/image/upload/v1740838529/u4fpaottpjoazywl2oly.jpg",
    },
    expiryDate: "2025-03-20",
  },
];

export default function RentalList() {
  const [selectedRoom, setSelectedRoom] = useState(null);

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Danh sách phòng */}
          <div className="col-span-1 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Danh sách phòng</h2>
            {rooms.map((room) => (
              <motion.div
                key={room.id}
                whileHover={{ scale: 1.05 }}
                className={`p-4 border rounded-xl cursor-pointer mb-3 transition ${selectedRoom?.id === room.id ? 'bg-red-300' : 'bg-gray-50 hover:bg-red-200'}`}
                onClick={() => setSelectedRoom(room)}
              >
                <p className="font-semibold text-red-700">{room.name}</p>
                <p>Ngày thuê: {room.rentDate}</p>
                <p className="text-sm text-gray-600">Trạng thái: {room.status}</p>
              </motion.div>
            ))}
          </div>

          {/* Thông tin chi tiết */}
          <div className="col-span-2 bg-white p-8 rounded-xl shadow-lg">
            {selectedRoom ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <img src={selectedRoom.image} alt={selectedRoom.name} className="w-full h-52 object-cover rounded-xl mb-4" />
                <h2 className="text-2xl font-bold text-red-600 mb-2">{selectedRoom.name}</h2>
                <p className="text-lg font-semibold text-gray-800">Giá: {selectedRoom.price}</p>
                <div className="flex items-center mt-3">
                  <img src={selectedRoom.owner.image} alt={selectedRoom.owner.name} className="w-12 h-12 rounded-full mr-3 border-2 border-red-500" />
                  <p className="text-gray-700">Chủ nhà: {selectedRoom.owner.name}</p>
                </div>
                <p className="mt-3 text-gray-700">Ngày thuê: {selectedRoom.rentDate}</p>
                <p className="text-gray-700">Ngày hết hạn: {selectedRoom.expiryDate}</p>
                <p className="text-gray-500">Trạng thái: {selectedRoom.status}</p>
                <div className="mt-5 flex gap-4">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="bg-red-500 text-white px-5 py-2 rounded-xl shadow-md hover:bg-red-400 transition"
                  >
                    Báo cáo
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="bg-red-500 text-white px-5 py-2 rounded-xl shadow-md hover:bg-red-400 transition"
                  >
                    Đánh giá
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <p className="text-center text-gray-500">Chọn một phòng để xem chi tiết</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
