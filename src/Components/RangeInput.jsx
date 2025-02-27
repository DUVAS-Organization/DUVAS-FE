// RangeInput.jsx
import React from 'react';

const RangeInput = ({
    fromValue,
    toValue,
    onChangeFrom,
    onChangeTo,
    unit,
    fromLabel = 'Từ:',
    toLabel = 'Đến:',
    minPlaceholder = 'Từ',
    maxPlaceholder = 'Đến',
    minAllowed, // Giá trị nhỏ nhất được phép cho ô từ
    maxAllowed  // Giá trị lớn nhất được phép cho ô đến
}) => {
    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col items-center">
                <label className="text-sm font-medium text-black mb-1">
                    {fromLabel} {fromValue} {unit}
                </label>
                <input
                    type="number"
                    placeholder={minPlaceholder}
                    className="border rounded px-2 py-1 text-gray-800 text-center w-20"
                    value={fromValue}
                    onChange={(e) => {
                        let value = Number(e.target.value);
                        // Giá trị không được nhỏ hơn minAllowed và không vượt quá giá trị hiện tại của ô đến
                        value = Math.max(minAllowed, Math.min(value, toValue));
                        onChangeFrom(value);
                    }}
                />
            </div>
            <span className="text-xl text-gray-600">→</span>
            <div className="flex flex-col items-center">
                <label className="text-sm font-medium text-black mb-1">
                    {toLabel} {toValue} {unit}
                </label>
                <input
                    type="number"
                    placeholder={maxPlaceholder}
                    className="border rounded px-2 py-1 text-gray-800 text-center w-20"
                    value={toValue}
                    onChange={(e) => {
                        let value = Number(e.target.value);
                        // Giá trị không được nhỏ hơn ô từ và không vượt quá maxAllowed
                        value = Math.max(fromValue, Math.min(value, maxAllowed));
                        onChangeTo(value);
                    }}
                />
            </div>
        </div>
    );
};

export default RangeInput;
