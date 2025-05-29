import React from 'react';
import { currencies } from '../utils/currencies';
import { Currency } from '../types';

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  blackMode: boolean;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ value, onChange}) => {
  return (
    <div>
      <label className={`block text-sm font-medium`}>
        Currency
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 block w-full rounded-md border-black focus:ring-black focus:border-black sm:text-sm`}
      >
        {currencies.map((currency: Currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.symbol} - {currency.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;