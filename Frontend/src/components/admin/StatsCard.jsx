const StatsCard = ({ icon: Icon, label, value, trend, trendValue, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
        </div>
        <div className={`${colorClasses[color]} bg-opacity-10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color === 'blue' ? 'text-blue-600' : color === 'green' ? 'text-green-600' : color === 'purple' ? 'text-purple-600' : color === 'orange' ? 'text-orange-600' : 'text-red-600'}`} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
          <span className={`text-xs font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trendValue}
          </span>
          <span className="text-xs font-semibold text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
