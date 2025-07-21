import React, { useState, useEffect } from 'react'
import { Target, Plus, Edit, Trash2, CheckCircle, Clock, TrendingUp, X } from 'lucide-react'
import apiService from '../services/api'

interface Goal {
  _id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: string
  status: 'active' | 'completed' | 'overdue'
  createdAt: string
}

interface GoalTrackingProps {
  workspaceId: string
  onClose: () => void
}

const GoalTracking: React.FC<GoalTrackingProps> = ({ workspaceId, onClose }) => {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target: 0,
    unit: 'tasks',
    deadline: ''
  })

  useEffect(() => {
    loadGoals()
  }, [workspaceId])

  const loadGoals = async () => {
    try {
      setIsLoading(true)
      // Mock data for now
      const mockGoals: Goal[] = [
        {
          _id: '1',
          title: 'Complete 50 tasks this month',
          description: 'Increase team productivity by completing 50 tasks',
          target: 50,
          current: 32,
          unit: 'tasks',
          deadline: '2025-08-20',
          status: 'active',
          createdAt: '2025-07-20'
        },
        {
          _id: '2',
          title: 'Reduce average completion time',
          description: 'Improve efficiency by reducing task completion time',
          target: 3,
          current: 4.2,
          unit: 'days',
          deadline: '2025-08-15',
          status: 'active',
          createdAt: '2025-07-20'
        },
        {
          _id: '3',
          title: 'Onboard 3 new team members',
          description: 'Expand the team by adding 3 new members',
          target: 3,
          current: 1,
          unit: 'members',
          deadline: '2025-08-30',
          status: 'active',
          createdAt: '2025-07-20'
        }
      ]
      setGoals(mockGoals)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Mock API call
      const newGoal: Goal = {
        _id: Date.now().toString(),
        ...formData,
        current: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      }
      setGoals(prev => [...prev, newGoal])
      setFormData({ title: '', description: '', target: 0, unit: 'tasks', deadline: '' })
      setShowAddGoal(false)
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const handleUpdateProgress = async (goalId: string, newProgress: number) => {
    try {
      setGoals(prev => prev.map(goal => 
        goal._id === goalId 
          ? { ...goal, current: newProgress }
          : goal
      ))
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return
    
    try {
      setGoals(prev => prev.filter(goal => goal._id !== goalId))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'overdue': return 'text-red-600'
      default: return 'text-blue-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'overdue': return <Clock className="w-4 h-4" />
      default: return <TrendingUp className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Target className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Goal Tracking</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddGoal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Goal</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Goals List */}
          <div className="space-y-6">
            {goals.map((goal) => {
              const progressPercentage = getProgressPercentage(goal.current, goal.target)
              const isCompleted = goal.current >= goal.target
              const StatusIcon = getStatusIcon(goal.status)

              return (
                <div key={goal._id} className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        <div className={`flex items-center space-x-1 ${getStatusColor(goal.status)}`}>
                          {StatusIcon}
                          <span className="text-sm font-medium capitalize">{goal.status}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{goal.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progress: {goal.current} / {goal.target} {goal.unit}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-primary-600'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Deadline */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {/* Update Progress */}
                      <input
                        type="number"
                        value={goal.current}
                        onChange={(e) => handleUpdateProgress(goal._id, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="0"
                        max={goal.target}
                      />
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {goals.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Set</h3>
              <p className="text-gray-600 mb-4">
                Set goals to track your team's progress and achievements.
              </p>
              <button
                onClick={() => setShowAddGoal(true)}
                className="btn-primary"
              >
                Create Your First Goal
              </button>
            </div>
          )}
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Add New Goal</h3>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddGoal} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter goal title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter goal description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target
                    </label>
                    <input
                      type="number"
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="tasks">Tasks</option>
                      <option value="days">Days</option>
                      <option value="members">Members</option>
                      <option value="projects">Projects</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddGoal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoalTracking 