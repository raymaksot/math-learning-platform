import React from "react";

/** Простой util для склейки классов */
function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Состояние загрузки: блокирует клик и показывает спиннер */
  isLoading?: boolean;
  /** Отключение кнопки */
  disabled?: boolean;
  /** Варианты оформления */
  variant?: ButtonVariant;
  /** Размеры */
  size?: ButtonSize;
  /** Иконка слева */
  startIcon?: React.ReactNode;
  /** Иконка справа */
  endIcon?: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
  secondary:
    "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-900",
  outline:
    "border border-gray-300 text-gray-900 hover:bg-gray-50 focus-visible:ring-blue-600",
  ghost:
    "text-gray-900 hover:bg-gray-100 focus-visible:ring-blue-600",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      isLoading,
      disabled,
      variant = "primary",
      size = "md",
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {/* Спиннер */}
        {isLoading && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent"
            aria-hidden="true"
          />
        )}
        {!isLoading && startIcon}
        <span>{children}</span>
        {!isLoading && endIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
