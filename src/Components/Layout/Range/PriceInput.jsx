// PriceInput.jsx
import React from 'react';
import { NumericFormat } from 'react-number-format';

const PriceInput = ({ value, onChange, ...rest }) => {
  return (
    <NumericFormat
      value={value}
      thousandSeparator="."
      decimalSeparator=","
      onValueChange={(values) => {
        // values.value là giá trị chưa định dạng
        onChange(values.value);
      }}
      className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
      placeholder="Nhập giá"
      {...rest}
    />
  );
};

export default PriceInput;
