import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Settings,
  Users,
  Calendar,
  FileText,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import KanbanBoard from '../components/KanbanBoard'

interface WorkspaceData {
  id: string
  name: string
  description: string
  memberCount: number
  color: string
  createdAt: string
  members: Array<{
    id: string
    name: string
    avatar: string
    role: string
  }>
}

const Workspace = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock workspace data
  const mockWorkspace: WorkspaceData = {
    id: id || '1',
    name: 'Product Development',
    description: 'Main product development workspace for the TaskFlow platform. This workspace contains all tasks related to feature development, bug fixes, and product improvements.',
    memberCount: 8,
    color: 'bg-blue-500',
    createdAt: '2024-01-15',
    members: [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        role: 'Admin'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        role: 'Member'
      },
      {
        id: '3',
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        role: 'Member'
      }
    ]
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Simulate API call to fetch workspace data
    setTimeout(() => {
      setWorkspace(mockWorkspace)
    }, 500)
  }, [id, user, navigate])

  if (!user || !workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${workspace.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {workspace.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{workspace.name}</h1>
                  <p className="text-sm text-gray-600">{workspace.memberCount} members</p>
                </div>
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

              <button className="btn-primary flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>

              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Workspace Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
          >
            {/* Description */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About this workspace</h2>
                <p className="text-gray-600 leading-relaxed">
                  {workspace.description}
                </p>
                <div className="flex items-center space-x-6 mt-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{workspace.memberCount} members</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all
                </button>
              </div>
              
              <div className="space-y-3">
                {workspace.members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
                + Invite members
              </button>
            </div>
          </motion.div>

          {/* Kanban Board */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <KanbanBoard workspaceId={workspace.id} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Workspace 