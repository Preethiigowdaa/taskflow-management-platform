import React, { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import TaskCard from './TaskCard'
import CreateTaskModal from './CreateTaskModal'
import EditTaskModal from './EditTaskModal'
import apiService from '../services/api'
import { Task, CreateTaskData, UpdateTaskData } from '../services/api'

interface TaskBoardProps {
  workspaceId: string
}

const TaskBoard: React.FC<TaskBoardProps> = ({ workspaceId }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')

  const statuses = [
    { id: 'todo', name: 'To Do', color: 'bg-gray-100' },
    { id: 'in-progress', name: 'In Progress', color: 'bg-blue-100' },
    { id: 'review', name: 'Review', color: 'bg-yellow-100' },
    { id: 'done', name: 'Done', color: 'bg-green-100' }
  ]

  // Debug: Log all tasks and their statuses
  console.log('All tasks:', tasks)
  console.log('Filtered tasks:', filteredTasks)
  tasks.forEach(task => {
    console.log(`Task ${task._id}: status = "${task.status}"`)
  })

  useEffect(() => {
    loadTasks()
  }, [workspaceId])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchTerm, statusFilter, assigneeFilter])

  const loadTasks = async () => {
    try {
      setIsLoading(true)
      const response = await apiService.getTasks(workspaceId)
      console.log('Tasks loaded:', response)
      if (response.success && response.data) {
        setTasks(response.data)
        console.log('Tasks set:', response.data)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(task => 
        task.assignee?._id === assigneeFilter
      )
    }

    setFilteredTasks(filtered)
  }



  const handleCreateTask = async (taskData: CreateTaskData) => {
    try {
      const response = await apiService.createTask(workspaceId, taskData)
      if (response.success && response.data) {
        setTasks(prev => [...prev, response.data!])
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    console.log('Deleting task:', taskId)
    try {
      await apiService.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task._id !== taskId))
      console.log('Task deleted successfully')
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleMoveTask = async (taskId: string, newStatus: string) => {
    try {
      await apiService.updateTask(taskId, { status: newStatus as any })
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, status: newStatus as any } : task
      ))
    } catch (error) {
      console.error('Error moving task:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowEditModal(true)
  }

  const handleUpdateTask = async (taskId: string, data: UpdateTaskData) => {
    try {
      const response = await apiService.updateTask(taskId, data)
      if (response.success && response.data) {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? response.data! : task
        ))
      }
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const getTasksByStatus = (status: string) => {
    const tasksInStatus = filteredTasks.filter(task => task.status === status)
    console.log(`Tasks in ${status}:`, tasksInStatus)
    return tasksInStatus
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      {filteredTasks.length === 0 && !isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first task to get started with task management.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Task
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-4 gap-6 overflow-x-auto">
          {statuses.map(status => (
            <div key={status.id} className="flex flex-col min-w-80">
              <div className={`${status.color} rounded-lg p-4 mb-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{status.name}</h3>
                  <span className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-sm font-medium">
                    {getTasksByStatus(status.id).length}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-h-96 p-2 rounded-lg border-2 border-dashed border-gray-200">
                {getTasksByStatus(status.id).map((task) => {
                  console.log(`Rendering task ${task._id} in ${status.id} column`)
                  return (
                    <div key={task._id} className="mb-3">
                      <TaskCard
                        task={task}
                        onDelete={handleDeleteTask}
                        onUpdate={loadTasks}
                        onEdit={handleEditTask}
                      />
                      {/* Status Move Buttons */}
                      <div className="mt-2 flex space-x-1">
                        {statuses.map(targetStatus => {
                          if (targetStatus.id !== status.id) {
                            return (
                              <button
                                key={targetStatus.id}
                                onClick={() => handleMoveTask(task._id, targetStatus.id)}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                              >
                                → {targetStatus.name}
                              </button>
                            )
                          }
                          return null
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          workspaceId={workspaceId}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Edit Task Modal */}
      {showEditModal && editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => {
            setShowEditModal(false)
            setEditingTask(null)
          }}
          onSubmit={handleUpdateTask}
        />
      )}
    </div>
  )
}

export default TaskBoard 