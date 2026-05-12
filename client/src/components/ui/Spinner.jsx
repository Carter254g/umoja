import { clsx } from 'clsx';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
    xl: 'w-12 h-12 border-3',
  };

  return (
    <div className={clsx(
      'rounded-full border-primary-500 border-t-transparent animate-spin',
      sizes[size],
      className
    )} />
  );
};

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-dark-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center animate-pulse-slow shadow-glow-green">
        <span className="text-white font-bold text-2xl">U</span>
      </div>
      <Spinner size="md" />
      <p className="text-dark-400 text-sm">Loading Umoja...</p>
    </div>
  </div>
);

export default Spinner;
