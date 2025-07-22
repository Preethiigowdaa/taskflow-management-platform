import React, { useState, useEffect } from 'react'
import { User, Mail, Crown, Shield, Users, UserCheck, UserX, Plus, X, Send } from 'lucide-react'
import apiService from '../services/api'
import { Workspace, User as ApiUser } from '../services/api'

interface TeamManagementProps {
  workspace: Workspace
  onClose: () => void
  onUpdate: () => void
}

const TeamManagement: React.FC<TeamManagementProps> = ({ workspace, onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [isInviting, setIsInviting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const roles = [
    { id: 'owner', name: 'Owner', icon: Crown, color: 'text-yellow-600', description: 'Full access to everything' },
    { id: 'admin', name: 'Admin', icon: Shield, color: 'text-red-600', description: 'Manage workspace and members' },
    { id: 'member', name: 'Member', icon: Users, color: 'text-blue-600', description: 'Create and edit tasks' },
    { id: 'viewer', name: 'Viewer', icon: UserCheck, color: 'text-green-600', description: 'View only access' }
  ]

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    console.log('Inviting member:', { workspaceId: workspace._id, email: inviteEmail, role: inviteRole })
    setIsInviting(true)
    try {
      await apiService.addWorkspaceMember(workspace._id, inviteEmail, inviteRole)
      setInviteEmail('')
      setInviteRole('member')
      onUpdate()
    } catch (error) {
      console.error('Error inviting member:', error)
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiService.updateWorkspaceMemberRole(workspace._id, userId, newRole)
      onUpdate()
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await apiService.removeWorkspaceMember(workspace._id, userId)
      onUpdate()
    } catch (error) {
      console.error('Error removing member:', error)
    }
  }

  const filteredMembers = workspace.members.filter(member =>
    member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleInfo = (roleId: string) => {
    return roles.find(role => role.id === roleId) || roles[2]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Team Management</h2>
              <p className="text-sm text-gray-600">{workspace.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Invite New Member */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite New Member</h3>
            <form onSubmit={handleInviteMember} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isInviting}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isInviting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Invite</span>
              </button>
            </form>
          </div>

          {/* Team Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Members ({workspace.members.length})</h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search members..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const roleInfo = getRoleInfo(member.role)
                const RoleIcon = roleInfo.icon

                return (
                  <div key={member.user._id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{member.user.name}</h4>
                          <div className="flex items-center space-x-1">
                            <RoleIcon className={`w-4 h-4 ${roleInfo.color}`} />
                            <span className="text-sm text-gray-600">{roleInfo.name}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{member.user.email}</p>
                        <p className="text-xs text-gray-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Role Selector */}
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.user._id, e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        disabled={member.role === 'owner'}
                      >
                        {roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>

                      {/* Remove Member Button */}
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No members found</p>
              </div>
            )}
          </div>

          {/* Role Descriptions */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Role Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map(role => {
                const RoleIcon = role.icon
                return (
                  <div key={role.id} className="flex items-start space-x-3">
                    <RoleIcon className={`w-5 h-5 ${role.color} mt-0.5`} />
                    <div>
                      <h5 className="font-medium text-gray-900">{role.name}</h5>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamManagement 