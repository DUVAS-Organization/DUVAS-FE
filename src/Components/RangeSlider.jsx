import React from "react";

const RangeSlider = ({ min, max, minValue, maxValue, onChange }) => {
    // Tính phần trăm vị trí của các giá trị trên track
    const minPercent = ((minValue - min) / (max - min)) * 100;
    const maxPercent = ((maxValue - min) / (max - min)) * 100;

    const handleMinChange = (e) => {
        const value = Math.min(Number(e.target.value), maxValue - 1);
        onChange(value, maxValue);
    };

    const handleMaxChange = (e) => {
        const value = Math.max(Number(e.target.value), minValue + 1);
        onChange(minValue, value);
    };

    return (
        <div className="relative w-full mt-4">
            {/* Track nền */}
            <div className="absolute inset-0 h-2 bg-gray-300 rounded" />
            {/* Vùng được chọn */}
            <div
                className="absolute h-2 bg-teal-500 rounded"
                style={{
                    left: `${minPercent}%`,
                    right: `${100 - maxPercent}%`,
                }}
            />
            {/* Input range cho giá tối thiểu */}
            <input
                type="range"
                min={min}
                max={max}
                value={minValue}
                onChange={handleMinChange}
                className="absolute w-full h-2 opacity-0 pointer-events-auto z-10"
            />
            {/* Input range cho giá tối đa */}
            <input
                type="range"
                min={min}
                max={max}
                value={maxValue}
                onChange={handleMaxChange}
                className="absolute w-full h-2 opacity-0 pointer-events-auto z-20"
            />
            {/* Thumb cho giá tối thiểu */}
            <div
                className="absolute w-4 h-4 bg-teal-500 rounded-full z-30"
                style={{
                    left: `calc(${minPercent}% - 0.5rem)`,
                    top: "-0.4rem",
                }}
            />
            {/* Thumb cho giá tối đa */}
            <div
                className="absolute w-4 h-4 bg-teal-500 rounded-full z-30"
                style={{
                    left: `calc(${maxPercent}% - 0.5rem)`,
                    top: "-0.4rem",
                }}
            />
        </div>
    );
};

export default RangeSlider;
