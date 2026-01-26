import React, { useState, useEffect, type ChangeEvent } from 'react';
import { formatNumberWithCommas, unformatNumber } from '../../utilities/FormatterUtility';

interface FormattedNumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | string;
  onChange: (value: number | '') => void;
}

const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({ value, onChange, ...rest }) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Update display value when the external value changes
    setDisplayValue(value ? formatNumberWithCommas(value) : '');
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = unformatNumber(e.target.value);
    const numericValue = rawValue ? parseInt(rawValue, 10) : '';

    // Update the internal display value with the formatted number
    setDisplayValue(rawValue ? formatNumberWithCommas(rawValue) : '');

    // Call the parent onChange with the raw numeric value
    onChange(numericValue);
  };

  return (
    <input
      {...rest}
      type="text" // Use text type to allow for commas
      value={displayValue}
      onChange={handleChange}
      inputMode="numeric" // Helps mobile users see a numeric keypad
    />
  );
};

export default FormattedNumberInput;
