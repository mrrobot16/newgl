import type { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement>;

export function InputField({ className = "", ...props }: InputFieldProps) {
  return (
    <input
      {...props}
      className={`input-field h-9 rounded border border-gray-300 bg-white px-3 font-normal leading-[1.2] text-gray-900 placeholder:text-gray-400 transition-[background-color,border-color,box-shadow] duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 ${className}`.trim()}
    />
  );
}
