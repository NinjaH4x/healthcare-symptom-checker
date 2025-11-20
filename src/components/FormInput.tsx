"use client";

import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  id: string;
  label?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  as?: 'input' | 'select';
  options?: Option[];
}

export default function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  inputClassName = '',
  as = 'input',
  options = [],
}: Props) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="text-sm font-medium block mb-1" style={{ color: '#23408e' }}>
          {label}
        </label>
      )}

      {as === 'select' ? (
        <select
          id={id}
          value={String(value)}
          onChange={onChange as (e: React.ChangeEvent<HTMLSelectElement>) => void}
          disabled={disabled}
          className={`w-full px-3 py-2 border-2 rounded text-black ${className} ${inputClassName}`}
          style={{ borderColor: '#A6CBFF', backgroundColor: '#F0F6FF' }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value as string}
          onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border-2 rounded text-black ${className} ${inputClassName}`}
          style={{ borderColor: '#A6CBFF', backgroundColor: '#F0F6FF' }}
        />
      )}
    </div>
  );
}
