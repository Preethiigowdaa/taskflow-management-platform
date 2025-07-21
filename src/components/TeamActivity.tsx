import React, { useState, useEffect } from 'react'
import { Activity, User, Plus, Edit, Trash2, CheckCircle, Clock, MessageCircle, Calendar, X } from 'lucide-react'
import apiService from '../services/api'

interface TeamActivityProps {
  workspaceId: string
  onClose: () => void
}

interface ActivityItem {
  _id: string
  type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added' | 'member_joined' | 'member_left'
  user: {
    _id: string
    name: string
    avatar: string
  }
  task?: {
    _id: string
    title: string
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
      // For now, we'll use mock data since the backend activity endpoint might not exist yet
      const mockActivities: ActivityItem[] = [
        {
          _id: '1',
          type: 'task_created',
          user: {
            _id: 'user1',
            name: 'John Doe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          },
          task: {
            _id: 'task1',
            title: 'Design new landing page'
          },
          message: 'created a new task',
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          _id: '2',
          type: 'task_completed',
          user: {
            _id: 'user2',
            name: 'Jane Smith',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          },
          task: {
            _id: 'task2',
            title: 'Review pull request'
          },
          message: 'completed a task',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
          _id: '3',
          type: 'comment_added',
          user: {
            _id: 'user1',
            name: 'John Doe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          },
          task: {
            _id: 'task3',
            title: 'Update documentation'
          },
          message: 'added a comment',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() // 4 hours ago
        },
        {
          _id: '4',
          type: 'member_joined',
          user: {
            _id: 'user3',
            name: 'Mike Johnson',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          message: 'joined the workspace',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        }
      ]
      setActivities(mockActivities)
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
                      {activity.task && (
                        <span className="font-medium text-primary-600">"{activity.task.title}"</span>
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