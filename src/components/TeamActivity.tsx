import React, { useState, useEffect } from 'react'
import { Activity, User, Plus, Edit, Trash2, CheckCircle, Clock, MessageCircle, Calendar, X } from 'lucide-react'
import apiService from '../services/api'

interface TeamActivityProps {
  workspaceId: string
  onClose: () => void
}

interface ActivityItem {
  _id: string
  type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'member_joined' | 'member_left' | 'goal_created' | 'goal_updated' | 'goal_completed' | 'workspace_created' | 'workspace_updated'
  user: {
    _id: string
    name: string
    avatar: string
  }
  entity?: {
    type: string
    id: string
    populatedId?: {
      _id: string
      title?: string
      name?: string
    }
  }
  metadata?: {
    title?: string
  }
  message: string
  createdAt: string
}

const TeamActivity: React.FC<TeamActivityProps> = ({ workspaceId, onClose }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [workspaceId])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getActivities(workspaceId, 50, 0)
      if (response.success && response.data) {
        setActivities(response.data as ActivityItem[])
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <Plus className="w-4 h-4 text-blue-600" />
      case 'task_updated':
        return <Edit className="w-4 h-4 text-yellow-600" />
      case 'task_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'comment_added':
        return <MessageCircle className="w-4 h-4 text-purple-600" />
      case 'member_joined':
        return <User className="w-4 h-4 text-green-600" />
      case 'member_left':
        return <User className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Team Activity</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={activity.user.avatar}
                    alt={activity.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{activity.user.name}</span>
                      {getActivityIcon(activity.type)}
                      <span className="text-gray-600">{activity.message}</span>
                      {(activity.entity?.populatedId?.title || activity.metadata?.title) && (
                        <span className="font-medium text-primary-600">"{activity.entity?.populatedId?.title || activity.metadata?.title}"</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamActivity 