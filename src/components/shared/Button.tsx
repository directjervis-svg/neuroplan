/**
 * BUTTON COMPONENT
 * NeuroExecução (KNH4)
 *
 * Botão base com variantes e estados
 * Acessível (44px mínimo) e neuroadaptativo
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger';
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** Ícone à esquerda */
  iconLeft?: React.ReactNode;
  /** Ícone à direita */
  iconRight?: React.ReactNode;
  /** Estado de carregamento */
  loading?: boolean;
  /** Largura completa */
  fullWidth?: boolean;
  /** Classe CSS adicional */
  className?: string;
  /** Filhos do componente */
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      iconLeft,
      iconRight,
      loading = false,
      fullWidth = false,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Classes base
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'gap-2',
      'border-0',
      'cursor-pointer',
      'transition',
      'duration-base',
      'font-semibold',
      'select-none',
      'focus-ring',
    ];

    // Classes de tamanho
    const sizeClasses = {
      sm: ['px-4', 'py-2', 'text-sm', 'rounded-md', 'min-h-[36px]'],
      md: ['px-6', 'py-3', 'text-base', 'rounded-lg', 'min-h-[44px]'],
      lg: ['px-8', 'py-4', 'text-lg', 'rounded-xl', 'min-h-[52px]'],
    };

    // Classes de variante
    const variantClasses = {
      primary: [
        'bg-[#FFD400]',
        'text-[#000000]',
        'hover:bg-[#FFBE00]',
        'hover:shadow-accent',
        'hover:translate-y-[-2px]',
        'active:translate-y-0',
      ],
      secondary: [
        'bg-[#F5F5F5]',
        'text-[#1A1A1A]',
        'hover:bg-[#EBEBEB]',
        'hover:shadow-sm',
      ],
      dark: [
        'bg-[#000000]',
        'text-[#FFFFFF]',
        'hover:bg-[#1A1A1A]',
        'hover:shadow-md',
      ],
      ghost: [
        'bg-transparent',
        'text-[#1A1A1A]',
        'hover:bg-[#F5F5F5]',
      ],
      danger: [
        'bg-[#FF6B6B]',
        'text-[#FFFFFF]',
        'hover:bg-[#DD4B5B]',
        'hover:shadow-lg',
      ],
    };

    // Classes de estado disabled
    const disabledClasses = disabled || loading
      ? ['opacity-50', 'cursor-not-allowed', 'pointer-events-none']
      : [];

    // Classes de largura
    const widthClasses = fullWidth ? ['w-full'] : [];

    // Combinar classes
    const allClasses = [
      ...baseClasses,
      ...sizeClasses[size],
      ...variantClasses[variant],
      ...disabledClasses,
      ...widthClasses,
      className,
    ].join(' ');

    return (
      <button
        ref={ref}
        className={allClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && iconLeft && <span className="inline-flex">{iconLeft}</span>}
        {children}
        {!loading && iconRight && <span className="inline-flex">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
