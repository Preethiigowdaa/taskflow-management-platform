import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Plus, MoreVertical, Calendar, User, Tag, MessageCircle } from 'lucide-react'
import TaskCard from './TaskCard'

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

interface Column {
  id: string
  title: string
  color: string
  tasks: Task[]
}

interface KanbanBoardProps {
  workspaceId: string
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ workspaceId }) => {
  const [columns, setColumns] = useState<Column[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Design new landing page',
      description: 'Create a modern and responsive landing page design for the new product launch',
      status: 'todo',
      priority: 'high',
      assignee: {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      dueDate: '2024-02-15',
      tags: ['Design', 'Frontend'],
      comments: 3,
      attachments: 2
    },
    {
      id: '2',
      title: 'Implement user authentication',
      description: 'Add secure user authentication with JWT tokens and refresh token functionality',
      status: 'in-progress',
      priority: 'high',
      assignee: {
        id: '2',
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      dueDate: '2024-02-10',
      tags: ['Backend', 'Security'],
      comments: 8,
      attachments: 1
    },
    {
      id: '3',
      title: 'Write API documentation',
      description: 'Create comprehensive API documentation with examples and error codes',
      status: 'review',
      priority: 'medium',
      assignee: {
        id: '3',
        name: 'Emily Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      dueDate: '2024-02-12',
      tags: ['Documentation'],
      comments: 2,
      attachments: 0
    },
    {
      id: '4',
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment pipeline for the project',
      status: 'done',
      priority: 'medium',
      assignee: {
        id: '1',
        name: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      dueDate: '2024-02-05',
      tags: ['DevOps'],
      comments: 5,
      attachments: 3
    },
    {
      id: '5',
      title: 'Optimize database queries',
      description: 'Review and optimize slow database queries to improve performance',
      status: 'todo',
      priority: 'low',
      assignee: {
        id: '2',
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      dueDate: '2024-02-20',
      tags: ['Backend', 'Performance'],
      comments: 1,
      attachments: 0
    }
  ]

  const initialColumns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'bg-gray-500',
      tasks: mockTasks.filter(task => task.status === 'todo')
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'bg-blue-500',
      tasks: mockTasks.filter(task => task.status === 'in-progress')
    },
    {
      id: 'review',
      title: 'Review',
      color: 'bg-yellow-500',
      tasks: mockTasks.filter(task => task.status === 'review')
    },
    {
      id: 'done',
      title: 'Done',
      color: 'bg-green-500',
      tasks: mockTasks.filter(task => task.status === 'done')
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setColumns(initialColumns)
      setIsLoading(false)
    }, 500)
  }, [workspaceId])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const sourceTasks = [...sourceColumn.tasks]
    const destTasks = source.droppableId === destination.droppableId 
      ? sourceTasks 
      : [...destColumn.tasks]

    const [removed] = sourceTasks.splice(source.index, 1)
    destTasks.splice(destination.index, 0, removed)

    const newColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, tasks: sourceTasks }
      }
      if (col.id === destination.droppableId) {
        return { ...col, tasks: destTasks }
      }
      return col
    })

    setColumns(newColumns)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading board...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-3 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${
                              snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                            }`}
                          >
                            <TaskCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <button className="w-full mt-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add task</span>
              </button>
            </motion.div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

export default KanbanBoard 