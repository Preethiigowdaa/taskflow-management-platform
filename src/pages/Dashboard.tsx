import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Bell, 
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Activity,
  Plus,
  BarChart3,
  Target
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import apiService, { Workspace } from '../services/api'
import TaskBoard from '../components/TaskBoard'
import AnalyticsCard from '../components/AnalyticsCard'
import UserProfile from '../components/UserProfile'
import TeamManagement from '../components/TeamManagement'
import TeamActivity from '../components/TeamActivity'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import RealTimeMetrics from '../components/RealTimeMetrics'
import GoalTracking from '../components/GoalTracking'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showTeamManagement, setShowTeamManagement] = useState(false)
  const [showTeamActivity, setShowTeamActivity] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showGoalTracking, setShowGoalTracking] = useState(false)

  // Debug: Log selected workspace
  console.log('Selected workspace:', selectedWorkspace)
  console.log('Available workspaces:', workspaces)

  // Load real workspaces from API
  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setIsLoadingWorkspaces(true)
        const response = await apiService.getWorkspaces()
        if (response.success && response.data) {
          setWorkspaces(response.data)
          // Set the first workspace as selected if none is selected
          if (!selectedWorkspace && response.data.length > 0) {
            setSelectedWorkspace(response.data[0]._id)
          }
        }
      } catch (error) {
        console.error('Error loading workspaces:', error)
      } finally {
        setIsLoadingWorkspaces(false)
      }
    }

    if (user) {
      loadWorkspaces()
    }
  }, [user, selectedWorkspace])

  const analytics = [
    {
      title: 'Total Tasks',
      value: '124',
      change: '+12%',
      changeType: 'positive' as const,
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: 'In Progress',
      value: '34',
      change: '+5%',
      changeType: 'positive' as const,
      icon: <Clock className="w-6 h-6" />
    },
    {
      title: 'Overdue',
      value: '8',
      change: '-2%',
      changeType: 'negative' as const,
      icon: <AlertCircle className="w-6 h-6" />
    },
    {
      title: 'Team Members',
      value: '25',
      change: '+3',
      changeType: 'positive' as const,
      icon: <Users className="w-6 h-6" />
    }
  ]

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])



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
                    key={workspace._id}
                    onClick={() => setSelectedWorkspace(workspace._id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedWorkspace === workspace._id
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

              <button 
                onClick={() => setShowTeamActivity(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Team Activity"
              >
                <Activity className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowTeamManagement(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Team Management"
              >
                <Users className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowAnalytics(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Analytics Dashboard"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => setShowGoalTracking(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Goal Tracking"
              >
                <Target className="w-5 h-5" />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowUserProfile(true)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                >
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
          {/* Real-time Metrics */}
          {selectedWorkspace && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Metrics</h3>
              <RealTimeMetrics workspaceId={selectedWorkspace} />
            </motion.div>
          )}

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
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>

          {/* Workspace Selection or Create Workspace */}
          {isLoadingWorkspaces ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : workspaces.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Workspaces Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first workspace to start organizing tasks and collaborating with your team.
                </p>
                <button
                  onClick={() => navigate('/create-workspace')}
                  className="btn-primary"
                >
                  Create Your First Workspace
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TaskBoard workspaceId={selectedWorkspace || workspaces[0]?._id || ''} />
            </motion.div>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}

      {/* Team Management Modal */}
      {showTeamManagement && workspaces.length > 0 && (
        <TeamManagement 
          workspace={workspaces.find(w => w._id === selectedWorkspace) || workspaces[0]}
          onClose={() => setShowTeamManagement(false)}
          onUpdate={async () => {
            // Refresh workspaces to get updated member list
            try {
              const response = await apiService.getWorkspaces()
              if (response.success && response.data) {
                setWorkspaces(response.data)
              }
            } catch (error) {
              console.error('Error refreshing workspaces:', error)
            }
          }}
        />
      )}

      {/* Team Activity Modal */}
      {showTeamActivity && (
        <TeamActivity 
          workspaceId={selectedWorkspace || workspaces[0]?._id || ''}
          onClose={() => setShowTeamActivity(false)}
        />
      )}

      {/* Analytics Dashboard Modal */}
      {showAnalytics && workspaces.length > 0 && (
        <AnalyticsDashboard 
          workspace={workspaces.find(w => w._id === selectedWorkspace) || workspaces[0]}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* Goal Tracking Modal */}
      {showGoalTracking && (
        <GoalTracking 
          workspaceId={selectedWorkspace || workspaces[0]?._id || ''}
          onClose={() => setShowGoalTracking(false)}
        />
      )}

      {/* Floating Create Workspace Button */}
      <button
        onClick={() => navigate('/create-workspace')}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-40"
        title="Create New Workspace"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}

export default Dashboard 