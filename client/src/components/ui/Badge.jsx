import { clsx } from 'clsx';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-dark-700 text-dark-300 border border-dark-600',
    active: 'badge-active',
    passed: 'badge-passed',
    failed: 'badge-failed',
    pending: 'badge-pending',
    primary: 'bg-primary-500/15 text-primary-400 border border-primary-500/30',
    gold: 'bg-gold-500/15 text-gold-400 border border-gold-500/30',
    red: 'bg-red-500/15 text-red-400 border border-red-500/30',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 font-medium rounded-full',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
};

export default Badge;
