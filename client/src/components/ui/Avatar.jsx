import { clsx } from 'clsx';

const colors = [
  'from-primary-500 to-primary-700',
  'from-gold-500 to-gold-700',
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-pink-500 to-pink-700',
  'from-orange-500 to-orange-700',
];

const getColor = (name) => {
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <div className={clsx(
      'rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white flex-shrink-0',
      getColor(name),
      sizes[size],
      className
    )}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
