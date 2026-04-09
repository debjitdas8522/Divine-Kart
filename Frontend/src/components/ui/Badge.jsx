const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantClasses = {
    default:  'bg-gray-100 text-gray-700',
    primary:  'bg-primary-100 text-primary-700',
    success:  'bg-green-100 text-green-800',
    warning:  'bg-yellow-100 text-yellow-800',
    danger:   'bg-red-100 text-red-800',
    info:     'bg-blue-100 text-blue-800',
    // Promotional badge variants
    off:      'bg-accent-red text-white font-black tracking-wider',
    new:      'bg-primary text-white font-black tracking-wider',
    hot:      'bg-orange-500 text-white font-black tracking-wider',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${variantClasses[variant] ?? variantClasses.default} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
