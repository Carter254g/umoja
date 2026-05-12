import { clsx } from 'clsx';

const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'md',
  onClick,
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'glass-card',
        paddings[padding],
        hover && 'hover:border-primary-500/30 hover:shadow-glow-green transition-all duration-200 cursor-pointer',
        glow && 'shadow-glow-green border-primary-500/20',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={clsx('flex items-center justify-between mb-6', className)}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={clsx('text-lg font-semibold text-white', className)}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={clsx(className)}>{children}</div>
);

export default Card;
