import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Bell, 
  Settings, 
  LogOut,
  BarChart3,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  User
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import KanbanBoard from '../components/KanbanBoard'
import AnalyticsCard from '../components/AnalyticsCard'

interface Workspace {
  id: string
  name: string
  description: string
  memberCount: number
  color: string
}

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)

  const workspaces: Workspace[] = [
    {
      id: '1',
      name: 'Product Development',
      description: 'Main product development workspace',
      memberCount: 8,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Marketing Campaign',
      description: 'Q1 marketing initiatives',
      memberCount: 5,
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Customer Support',
      description: 'Support ticket management',
      memberCount: 12,
      color: 'bg-purple-500'
    }
  ]

  const analytics = [
    {
      title: 'Total Tasks',
      value: '124',
      change: '+12%',
      changeType: 'positive',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: 'In Progress',
      value: '34',
      change: '+5%',
      changeType: 'positive',
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: 'Overdue',
      value: '8',
      change: '-2%',
      changeType: 'negative',
      icon: <AlertCircle className="w-6 h-6" />
    },
    {
      title: 'Team Members',
      value: '25',
      change: '+3',
      changeType: 'positive',
      icon: <Users className="w-6 h-6" />
    }
  ]

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-gray-900">TaskFlow</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-2">
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => setSelectedWorkspace(workspace.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedWorkspace === workspace.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {workspace.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>

              <div className="relative">
                <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {analytics.map((item, index) => (
              <AnalyticsCard key={index} {...item} />
            ))}
          </motion.div>

          {/* Workspace Selection (Mobile) */}
          <div className="md:hidden mb-6">
            <select
              value={selectedWorkspace || ''}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Workspace</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>

          {/* Kanban Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <KanbanBoard workspaceId={selectedWorkspace || '1'} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 