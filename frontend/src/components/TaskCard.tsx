import React, { useState } from 'react'
import { MoreVertical, Calendar, User, Tag, MessageCircle, CheckSquare, Clock } from 'lucide-react'
import { Task } from '../services/api'


interface TaskCardProps {
  task: Task
  onDelete: (taskId: string) => void
  onUpdate: () => void
  onEdit: (task: Task) => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onUpdate, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false)

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700'
  }

  const statusColors = {
    'todo': 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'review': 'bg-yellow-100 text-yellow-700',
    'done': 'bg-green-100 text-green-700'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return 'Overdue'
    } else if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Tomorrow'
    } else if (diffDays <= 7) {
      return `${diffDays} days`
    } else {
      return date.toLocaleDateString()
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className="relative ml-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
              <button
                onClick={() => {
                  onEdit(task)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(task._id)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags and Priority */}
      <div className="flex items-center space-x-2 mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {task.status.replace('-', ' ')}
        </span>
        {task.tags && task.tags.length > 0 && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            {task.tags[0]}
            {task.tags.length > 1 && ` +${task.tags.length - 1}`}
          </span>
        )}
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div className="flex items-center space-x-1 mb-3">
          <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            {formatDate(task.dueDate)}
          </span>
        </div>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center space-x-1 mb-3">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {task.assignee.name}
          </span>
        </div>
      )}

      {/* Progress */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="flex items-center space-x-1 mb-3">
          <CheckSquare className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length} subtasks
          </span>
        </div>
      )}

      {/* Comments */}
      {task.comments && task.comments.length > 0 && (
        <div className="flex items-center space-x-1 mb-3">
          <MessageCircle className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {task.reporter && (
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-700">
                  {task.reporter.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {task.estimatedHours && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {task.estimatedHours}h
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskCard 