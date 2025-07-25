import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Clock, Users, Target } from 'lucide-react'
import apiService from '../services/api'

interface RealTimeMetricsProps {
  workspaceId: string
}

interface Metric {
  label: string
  value: number
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  color: string
}

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ workspaceId }) => {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadMetrics, 30000)
    return () => clearInterval(interval)
  }, [workspaceId])

  const loadMetrics = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getRealTimeMetrics(workspaceId)
      if (response.success && response.data) {
        const metrics: Metric[] = response.data.map((item: any) => ({
          label: item.label,
          value: item.value,
          change: item.change,
          changeType: item.changeType,
          icon: item.label === 'Active Tasks' ? <Activity className="w-5 h-5" /> :
                item.label === 'Completed Today' ? <Target className="w-5 h-5" /> :
                item.label === 'Team Members' ? <Users className="w-5 h-5" /> :
                <Clock className="w-5 h-5" />,
          color: item.label === 'Active Tasks' ? 'text-blue-600' :
                 item.label === 'Completed Today' ? 'text-green-600' :
                 item.label === 'Team Members' ? 'text-purple-600' :
                 'text-orange-600'
        }))
        setMetrics(metrics)
      }
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getChangeIcon = (changeType: string) => {
    if (changeType === 'positive') {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (changeType === 'negative') {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${metric.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
              {metric.icon}
            </div>
            {getChangeIcon(metric.changeType)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{metric.label}</p>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <div className="flex items-center space-x-1 mt-1">
              {getChangeIcon(metric.changeType)}
              <span className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change > 0 ? '+' : ''}{metric.change}
              </span>
              <span className="text-sm text-gray-500">from yesterday</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RealTimeMetrics 