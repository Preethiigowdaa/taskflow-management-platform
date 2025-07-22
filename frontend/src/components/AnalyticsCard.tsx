import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface AnalyticsCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ReactNode
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center space-x-1 mt-2">
            {changeType === 'positive' ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change}
            </span>
            <span className="text-sm text-gray-500">from last month</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export default AnalyticsCard 