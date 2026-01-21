/**
 * INPUT COMPONENT
 * NeuroExecução (KNH4)
 *
 * Campo de entrada de texto base
 * Background #F5F5F5, altura mínima 44px
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label do campo */
  label?: string;
  /** Mensagem de erro */
  error?: string;
  /** Mensagem de ajuda */
  helpText?: string;
  /** Ícone à esquerda */
  iconLeft?: React.ReactNode;
  /** Ícone à direita */
  iconRight?: React.ReactNode;
  /** Largura completa */
  fullWidth?: boolean;
  /** Classe CSS adicional para o input */
  className?: string;
  /** Classe CSS adicional para o container */
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      iconLeft,
      iconRight,
      fullWidth = false,
      className = '',
      containerClassName = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    // Gerar ID único se não fornecido
    const inputId = id || `input-${React.useId()}`;

    // Classes do container
    const containerClasses = [
      fullWidth ? 'w-full' : 'w-auto',
      containerClassName,
    ].join(' ');

    // Classes base do input
    const baseClasses = [
      'bg-[#F5F5F5]',
      'border-0',
      'rounded-[12px]',
      'px-5',
      'py-4',
      'text-base',
      'text-[#1A1A1A]',
      'placeholder:text-[#A8A8A8]',
      'transition',
      'duration-base',
      'min-h-[44px]',
      'focus:outline-none',
      'focus:bg-[#EBEBEB]',
      'focus:ring-2',
      'focus:ring-[#FFC738]',
      'focus:ring-offset-0',
    ];

    // Classes com ícones
    const iconClasses = {
      left: iconLeft ? 'pl-12' : '',
      right: iconRight ? 'pr-12' : '',
    };

    // Classes de erro
    const errorClasses = error
      ? [
          'bg-[#FFE4E1]',
          'focus:bg-[#FFE4E1]',
          'ring-2',
          'ring-[#FF6B6B]',
        ]
      : [];

    // Classes de disabled
    const disabledClasses = disabled
      ? ['opacity-50', 'cursor-not-allowed', 'pointer-events-none']
      : [];

    // Classes de largura
    const widthClasses = fullWidth ? 'w-full' : '';

    // Combinar classes do input
    const inputClasses = [
      ...baseClasses,
      iconClasses.left,
      iconClasses.right,
      ...errorClasses,
      ...disabledClasses,
      widthClasses,
      className,
    ].join(' ');

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-semibold text-[#1A1A1A]"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Ícone Esquerda */}
          {iconLeft && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
              {iconLeft}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helpText
                ? `${inputId}-help`
                : undefined
            }
            {...props}
          />

          {/* Ícone Direita */}
          {iconRight && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]">
              {iconRight}
            </div>
          )}
        </div>

        {/* Help Text */}
        {helpText && !error && (
          <p
            id={`${inputId}-help`}
            className="mt-2 text-sm text-[#6B6B6B]"
          >
            {helpText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-[#FF6B6B] font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ============================================
   TEXTAREA VARIANT
   ============================================ */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label do campo */
  label?: string;
  /** Mensagem de erro */
  error?: string;
  /** Mensagem de ajuda */
  helpText?: string;
  /** Largura completa */
  fullWidth?: boolean;
  /** Classe CSS adicional para o textarea */
  className?: string;
  /** Classe CSS adicional para o container */
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helpText,
      fullWidth = false,
      className = '',
      containerClassName = '',
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    // Gerar ID único se não fornecido
    const textareaId = id || `textarea-${React.useId()}`;

    // Classes do container
    const containerClasses = [
      fullWidth ? 'w-full' : 'w-auto',
      containerClassName,
    ].join(' ');

    // Classes base do textarea
    const baseClasses = [
      'bg-[#F5F5F5]',
      'border-0',
      'rounded-[12px]',
      'px-5',
      'py-4',
      'text-base',
      'text-[#1A1A1A]',
      'placeholder:text-[#A8A8A8]',
      'transition',
      'duration-base',
      'focus:outline-none',
      'focus:bg-[#EBEBEB]',
      'focus:ring-2',
      'focus:ring-[#FFC738]',
      'focus:ring-offset-0',
      'resize-none',
    ];

    // Classes de erro
    const errorClasses = error
      ? [
          'bg-[#FFE4E1]',
          'focus:bg-[#FFE4E1]',
          'ring-2',
          'ring-[#FF6B6B]',
        ]
      : [];

    // Classes de disabled
    const disabledClasses = disabled
      ? ['opacity-50', 'cursor-not-allowed', 'pointer-events-none']
      : [];

    // Classes de largura
    const widthClasses = fullWidth ? 'w-full' : '';

    // Combinar classes
    const textareaClasses = [
      ...baseClasses,
      ...errorClasses,
      ...disabledClasses,
      widthClasses,
      className,
    ].join(' ');

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block mb-2 text-sm font-semibold text-[#1A1A1A]"
          >
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          disabled={disabled}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : helpText
              ? `${textareaId}-help`
              : undefined
          }
          {...props}
        />

        {/* Help Text */}
        {helpText && !error && (
          <p
            id={`${textareaId}-help`}
            className="mt-2 text-sm text-[#6B6B6B]"
          >
            {helpText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-2 text-sm text-[#FF6B6B] font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
