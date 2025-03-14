import React, { useState } from "react";
import { FaClock } from "react-icons/fa"; // Update icon here
import Swal from 'sweetalert2';
import { showCustomNotification } from '../../../Components/Notification';

const RoomRentalConfirmation = () => {
  const [formData, setFormData] = useState({
    price: "",
    deposit: "",
    startDate: "",
    endDate: "",
    contractFile: null
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roomData = {
    id: "R101",
    type: "Deluxe Suite",
    price: "$1200/month",
    status: "pending", // Changed status to pending
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af"
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.deposit) newErrors.deposit = "Deposit amount is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.contractFile) newErrors.contractFile = "Contract file is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      contractFile: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    showCustomNotification();
    
    setIsLoading(true);
    try {
      // Simulated API call
      setTimeout(() => {
        Swal.fire({
          title: 'Success!',
          text: 'Rental request submitted successfully',
          icon: 'success',
          confirmButtonText: 'Cool'
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const StatusIndicator = () => (
    <div className="flex items-center gap-2">
      <FaClock className="text-yellow-500 text-xl" />
      <span className="font-medium">Pending</span>
    </div>
  );

  const handleCancelRequest = () => {
    Swal.fire({
      title: 'Hủy Yêu cầu thuê phòng?',
      text: 'Bạn có chắc chắn muốn hủy yêu cầu này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        showCustomNotification("Cancel", "Yêu cầu của bạn đã bị hủy.");
        Swal.fire('Đã hủy!', 'Yêu cầu của bạn đã bị hủy.', 'success');
      } else {
        Swal.fire('Hủy bỏ', 'Yêu cầu của bạn vẫn còn hiệu lực', 'info');
      }
    });
  };
  

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Room Details */}
          <div className="relative h-64">
            <img 
              src={roomData.image}
              alt="Room Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267";
              }}
            />
            <div className="absolute top-4 right-4">
              <StatusIndicator />
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{roomData.type}</h1>
            <p className="text-gray-600 mb-4">Price: {roomData.price}</p>

            {/* Rental Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${errors.price ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Deposit Amount</label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${errors.deposit ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                  />
                  {errors.deposit && <p className="mt-1 text-sm text-red-500">{errors.deposit}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${errors.startDate ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border ${errors.endDate ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-red-500`}
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract File</label>
                  <input
                    type="file"
                    name="contractFile"
                    accept=".pdf,.doc,.docx" // You can adjust the accepted file types as needed
                    onChange={handleFileChange}
                    className={`mt-1 block w-full rounded-md border ${errors.contractFile ? "border-red-500" : "border-gray-300"} px-3 py-2 focus:outline-none`}
                  />
                  {errors.contractFile && <p className="mt-1 text-sm text-red-500">{errors.contractFile}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelRequest}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Cancel Request
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {isLoading ? "Processing..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomRentalConfirmation;
