import React from 'react';
import { clsx } from 'clsx';

const Input = ({ 
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  className = '',
  error = false,
  disabled = false,
  icon = null,
  ...props 
}) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  
  const stateClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300 focus:ring-shopee-orange focus:border-shopee-orange';
  
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  const classes = clsx(
    baseClasses,
    stateClasses,
    disabledClasses,
    className
  );
  
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={clsx(classes, icon && 'pl-10')}
        {...props}
      />
    </div>
  );
};

export default Input;
