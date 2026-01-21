/**
 * CARD COMPONENT
 * NeuroExecução (KNH4)
 *
 * Container base para cards
 * Radius 24px padrão Crextio
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante de padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Variante de hover */
  hoverable?: boolean;
  /** Selecionado */
  selected?: boolean;
  /** Classe CSS adicional */
  className?: string;
  /** Filhos do componente */
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'md',
      hoverable = false,
      selected = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Classes base
    const baseClasses = [
      'bg-[#FFFFFF]',
      'rounded-[24px]',
      'transition',
      'duration-base',
    ];

    // Classes de padding
    const paddingClasses = {
      none: [],
      sm: ['p-4'],
      md: ['p-6', 'md:p-8'],
      lg: ['p-8', 'md:p-12'],
    };

    // Classes de shadow
    const shadowClasses = ['shadow-md'];

    // Classes de hover
    const hoverClasses = hoverable
      ? [
          'hover:translate-y-[-2px]',
          'hover:shadow-lg',
          'cursor-pointer',
        ]
      : [];

    // Classes de selected
    const selectedClasses = selected
      ? [
          'bg-[#FFF9E6]',
          'border-2',
          'border-[#FFC738]',
          'shadow-accent',
        ]
      : [];

    // Combinar classes
    const allClasses = [
      ...baseClasses,
      ...paddingClasses[padding],
      ...shadowClasses,
      ...hoverClasses,
      ...selectedClasses,
      className,
    ].join(' ');

    return (
      <div ref={ref} className={allClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/* ============================================
   SUB-COMPONENTES
   ============================================ */

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export const CardHeader = ({ className = '', children, ...props }: CardHeaderProps) => {
  return (
    <div
      className={`mb-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children?: React.ReactNode;
}

export const CardTitle = ({ className = '', children, ...props }: CardTitleProps) => {
  return (
    <h3
      className={`text-xl font-bold text-[#1A1A1A] mb-2 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

CardTitle.displayName = 'CardTitle';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: React.ReactNode;
}

export const CardDescription = ({ className = '', children, ...props }: CardDescriptionProps) => {
  return (
    <p
      className={`text-base text-[#6B6B6B] leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};

CardDescription.displayName = 'CardDescription';

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export const CardContent = ({ className = '', children, ...props }: CardContentProps) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export const CardFooter = ({ className = '', children, ...props }: CardFooterProps) => {
  return (
    <div
      className={`mt-6 pt-6 border-t border-[#E8E5DD] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';
