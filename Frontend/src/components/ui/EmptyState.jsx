
const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <Icon className="w-16 h-16 text-gray-300 mb-4" />
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && actionLabel && (
        <button
          onClick={action}
          className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
