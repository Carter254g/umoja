import { clsx } from 'clsx';

const Input = ({
  label,
  error,
  hint,
  icon: Icon,
  rightIcon: RightIcon,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-dark-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            <Icon size={16} />
          </div>
        )}
        <input
          className={clsx(
            'input-dark',
            Icon && 'pl-10',
            RightIcon && 'pr-10',
            error && 'border-red-500 focus:border-red-500 focus:shadow-none focus:ring-red-500',
            className
          )}
          {...props}
        />
        {RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
            <RightIcon size={16} />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {hint && !error && <p className="text-sm text-dark-400">{hint}</p>}
    </div>
  );
};

export default Input;
