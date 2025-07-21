import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Palette, Hash, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import apiService, { CreateWorkspaceData } from '../services/api'

const CreateWorkspace = () => {
  const [formData, setFormData] = useState<CreateWorkspaceData>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '🏢'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ]

  const icons = [
    '🏢', '🚀', '💼', '🎯', '🌟', '🔧', '📊', '🎨',
    '📱', '💻', '🎮', '📚', '🏥', '🏫', '🏭', '🏪'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required'
    }

    if (formData.name.length > 50) {
      newErrors.name = 'Workspace name must be less than 50 characters'
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await apiService.createWorkspace(formData)
      if (response.success && response.data) {
        navigate(`/workspace/${response.data._id}`)
      }
    } catch (error) {
      console.error('Error creating workspace:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateWorkspaceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">TaskFlow</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Your Workspace
          </h1>
          <p className="text-gray-600 text-lg">
            Set up your first workspace to start organizing tasks and collaborating with your team
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Workspace Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Workspace Name *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter workspace name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what this workspace is for..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose a Color
              </label>
              <div className="grid grid-cols-8 gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange('color', color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      formData.color === color
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose an Icon
              </label>
              <div className="grid grid-cols-8 gap-3">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleInputChange('icon', icon)}
                    className={`w-12 h-12 rounded-lg border-2 text-2xl transition-all ${
                      formData.icon === icon
                        ? 'border-primary-500 bg-primary-50 scale-110'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {formData.name || 'Workspace Name'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formData.description || 'Workspace description will appear here...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-4 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Workspace...' : 'Create Workspace'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              You can always customize these settings later in workspace preferences
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default CreateWorkspace 