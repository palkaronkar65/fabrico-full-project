import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from 'react-feather';

export default function AnalyticsCard({ title, value, icon, trend, color = 'blue' }) {
  // Color mapping
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
    },
  };

  // Trend indicator
  const trendIndicator = {
    up: {
      icon: <ArrowUp className="w-4 h-4" />,
      text: 'text-green-500',
      bg: 'bg-green-50',
    },
    down: {
      icon: <ArrowDown className="w-4 h-4" />,
      text: 'text-red-500',
      bg: 'bg-red-50',
    },
    neutral: {
      icon: <Minus className="w-4 h-4" />,
      text: 'text-gray-500',
      bg: 'bg-gray-50',
    },
  };

  return (
    <div className={`p-5 rounded-xl ${colorMap[color].bg} border border-gray-100 shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color].iconBg}`}>
          <span className={`text-xl ${colorMap[color].text}`}>{icon}</span>
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center">
          <div className={`px-2 py-1 rounded-md ${trendIndicator[trend].bg} flex items-center`}>
            {trendIndicator[trend].icon}
            <span className={`ml-1 text-xs font-medium ${trendIndicator[trend].text}`}>
              {trend === 'up' ? 'Increased' : trend === 'down' ? 'Decreased' : 'No change'}
            </span>
          </div>
          <span className="ml-2 text-xs text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}