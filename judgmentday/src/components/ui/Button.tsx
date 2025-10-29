import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export default function Button({ 
  variant = "primary", 
  size = "md", 
  children, 
  className = "",
  ...props 
}: ButtonProps) {
  const baseStyles = "font-semibold rounded-lg transition";
  
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-600 text-white hover:bg-green-700",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-black"
  };
  
  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-8 py-4 text-lg"
  };
  
  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
