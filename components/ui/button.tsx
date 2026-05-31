import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={`button ${variant} ${className}`.trim()} {...props} />;
}
