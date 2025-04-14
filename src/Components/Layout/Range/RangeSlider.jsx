import React, { useRef } from "react";

const RangeSlider = ({ min, max, minValue, maxValue, onChange }) => {
    const sliderRef = useRef(null);

    const handleMouseDown = (thumb) => (e) => {
        e.preventDefault();
        const slider = sliderRef.current;
        if (!slider) return;
        const rect = slider.getBoundingClientRect();

        const handleMouseMove = (event) => {
            let x = event.clientX;
            // Giới hạn x trong phạm vi slider
            if (x < rect.left) x = rect.left;
            if (x > rect.right) x = rect.right;
            const percent = ((x - rect.left) / rect.width) * 100;
            const value = Math.round(min + ((max - min) * percent) / 100);
            if (thumb === "min") {
                const newMin = Math.min(value, maxValue - 1);
                onChange(newMin, maxValue);
            } else if (thumb === "max") {
                const newMax = Math.max(value, minValue + 1);
                onChange(minValue, newMax);
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const minPercent = ((minValue - min) / (max - min)) * 100;
    const maxPercent = ((maxValue - min) / (max - min)) * 100;

    return (
        <div
            className="relative w-full mt-4 "
            ref={sliderRef}
            style={{ height: "5px" }}
        >
            {/* Track nền */}
            <div
                className="absolute inset-0 h-2 bg-gray-300 rounded"
                style={{ top: "50%", transform: "translateY(-50%)" }}
            />
            {/* Vùng được chọn */}
            <div
                className="absolute h-2 bg-red-500 rounded"
                style={{
                    left: `${minPercent}%`,
                    width: `${maxPercent - minPercent}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                }}
            />
            {/* Thumb cho giá tối thiểu */}
            <div
                className="absolute w-4 h-4 bg-red-500 rounded-full cursor-pointer"
                style={{
                    left: `calc(${minPercent}% - 0.5rem)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                }}
                onMouseDown={handleMouseDown("min")}
            />
            {/* Thumb cho giá tối đa */}
            <div
                className="absolute w-4 h-4 bg-red-500 rounded-full cursor-pointer"
                style={{
                    left: `calc(${maxPercent}% - 0.5rem)`,
                    top: "50%",
                    transform: "translateY(-50%)",
                }}
                onMouseDown={handleMouseDown("max")}
            />
        </div>
    );
};

export default RangeSlider;
