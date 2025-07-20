import { motion } from 'framer-motion'
import { Calendar, User, Tag, MessageCircle, Paperclip, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee: {
    id: string
    name: string
    avatar: string
  }
  dueDate: string
  tags: string[]
  comments: number
  attachments: number
}

interface TaskCardProps {
  task: Task
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High'
      case 'medium':
        return 'Medium'
      case 'low':
        return 'Low'
      default:
        return 'Unknown'
    }
  }

  const isOverdue = new Date(task.dueDate) < new Date()

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
          <span className="text-xs font-medium text-gray-500 uppercase">
            {getPriorityText(task.priority)}
          </span>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {task.description}
      </p>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Assignee */}
          <div className="flex items-center space-x-1">
            <img
              src={task.assignee.avatar}
              alt={task.assignee.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-xs text-gray-600 hidden sm:block">
              {task.assignee.name}
            </span>
          </div>

          {/* Due Date */}
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className={`text-xs ${
              isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'
            }`}>
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {task.comments > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <MessageCircle className="w-3 h-3" />
              <span>{task.comments}</span>
            </div>
          )}
          {task.attachments > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TaskCard 