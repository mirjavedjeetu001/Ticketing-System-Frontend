import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, UserPlus, UserMinus, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import api from '../../api/client';
import { toast } from 'react-hot-toast';

interface Team {
  _id: string;
  name: string;
  description?: string;
  departmentId: {
    _id: string;
    name: string;
  };
  businessUnitId?: {
    _id: string;
    name: string;
    shortName: string;
  };
  teamLeadId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  members: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  settings: {
    maxMembers: number;
    allowSelfAssignment: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

interface Department {
  _id: string;
  name: string;
  businessUnitId?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface TeamManagementProps {
  searchTerm: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ searchTerm }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    businessUnitId: '',
    teamLeadId: '',
    maxMembers: 10,
    allowSelfAssignment: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsRes, deptsRes, businessUnitsRes, usersRes] = await Promise.all([
        api.get('/teams'),
        api.get('/departments'),
        api.get('/business-units'),
        api.get('/users')
      ]);
      
      setTeams(teamsRes.data.data.teams || []);
      setDepartments(deptsRes.data.data.departments || []);
      setBusinessUnits(businessUnitsRes.data.data.businessUnits || []);
      setUsers(usersRes.data.data.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        departmentId: formData.departmentId,
        businessUnitId: formData.businessUnitId || undefined,
        teamLeadId: formData.teamLeadId || undefined,
        settings: {
          maxMembers: formData.maxMembers,
          allowSelfAssignment: formData.allowSelfAssignment
        }
      };

      if (editingTeam) {
        await api.put(`/teams/${editingTeam._id}`, payload);
        toast.success('Team updated successfully');
      } else {
        await api.post('/teams', payload);
        toast.success('Team created successfully');
      }
      
      fetchData();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save team');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await api.delete(`/teams/${id}`);
      toast.success('Team deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      await api.patch(`/teams/${id}/toggle-status`);
      toast.success('Team status updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const addMember = async (teamId: string, userId: string) => {
    try {
      await api.post(`/teams/${teamId}/members`, { userId });
      toast.success('Member added successfully');
      fetchData();
      if (selectedTeamForMembers) {
        const updatedTeam = teams.find(t => t._id === teamId);
        if (updatedTeam) setSelectedTeamForMembers(updatedTeam);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    try {
      await api.delete(`/teams/${teamId}/members/${userId}`);
      toast.success('Member removed successfully');
      fetchData();
      if (selectedTeamForMembers) {
        const updatedTeam = teams.find(t => t._id === teamId);
        if (updatedTeam) setSelectedTeamForMembers(updatedTeam);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      departmentId: typeof team.departmentId === 'object' ? team.departmentId._id : team.departmentId,
      businessUnitId: team.businessUnitId ? (typeof team.businessUnitId === 'object' ? team.businessUnitId._id : team.businessUnitId) : '',
      teamLeadId: team.teamLeadId ? (typeof team.teamLeadId === 'object' ? team.teamLeadId._id : team.teamLeadId) : '',
      maxMembers: team.settings.maxMembers,
      allowSelfAssignment: team.settings.allowSelfAssignment
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTeam(null);
    setFormData({
      name: '',
      description: '',
      departmentId: '',
      businessUnitId: '',
      teamLeadId: '',
      maxMembers: 10,
      allowSelfAssignment: true
    });
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableUsers = users.filter(user => 
    !selectedTeamForMembers?.members.some(m => m._id === user._id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Teams</h2>
          <p className="text-sm text-slate-600 mt-1">{filteredTeams.length} teams found</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-teal-500/30"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div
            key={team._id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{team.name}</h3>
                      <span className="text-sm text-white/80">
                        {team.members.length}/{team.settings.maxMembers} members
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(team._id)}
                  className="ml-2"
                >
                  {team.isActive ? (
                    <ToggleRight className="w-8 h-8 text-white hover:text-green-200 transition-colors" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-white/50 hover:text-red-200 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Department:</span>{' '}
                  {typeof team.departmentId === 'object' ? team.departmentId.name : 'N/A'}
                </div>
                {team.businessUnitId && typeof team.businessUnitId === 'object' && (
                  <div className="text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Business Unit:</span>{' '}
                    {team.businessUnitId.shortName}
                  </div>
                )}
                {team.teamLeadId && typeof team.teamLeadId === 'object' && (
                  <div className="text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Team Lead:</span>{' '}
                    {team.teamLeadId.firstName} {team.teamLeadId.lastName}
                  </div>
                )}
                {team.description && (
                  <p className="text-sm text-slate-600 mt-2">{team.description}</p>
                )}
              </div>

              {/* Members Preview */}
              <div className="border-t border-slate-200/50 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">Members</h4>
                  <button
                    onClick={() => {
                      setSelectedTeamForMembers(team);
                      setShowMembersModal(true);
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Manage
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.members.slice(0, 3).map(member => (
                    <span key={member._id} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-100 text-teal-700">
                      {member.firstName} {member.lastName}
                    </span>
                  ))}
                  {team.members.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                      +{team.members.length - 3} more
                    </span>
                  )}
                  {team.members.length === 0 && (
                    <span className="text-xs text-slate-400">No members yet</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-200/50">
                <button
                  onClick={() => handleEdit(team)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(team._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No teams found</h3>
          <p className="text-slate-500">Create your first team to get started</p>
        </div>
      )}

      {/* Create/Edit Modal - Full Screen */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-8">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-bold">
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </h3>
              <p className="text-teal-100 text-sm mt-1">Fill in the details to {editingTeam ? 'update' : 'create'} a team</p>
            </div>

            <form id="team-form" onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(95vh-180px)] overflow-y-auto">
              {/* Basic Info - Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                    placeholder="Team Alpha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max Members
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              {/* Business Unit, Department and Team Lead */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Business Unit *
                  </label>
                  <select
                    required
                    value={formData.businessUnitId}
                    onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select Business Unit...</option>
                    {businessUnits.map(bu => (
                      <option key={bu._id} value={bu._id}>{bu.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department *
                  </label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select Department...</option>
                    {departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Team Lead
                  </label>
                  <select
                    value={formData.teamLeadId}
                    onChange={(e) => setFormData({ ...formData, teamLeadId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  >
                    <option value="">Select Team Lead...</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                  placeholder="Team description..."
                />
              </div>

              {/* Settings */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Team Settings</h4>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">Allow Self Assignment</span>
                  <input
                    type="checkbox"
                    checked={formData.allowSelfAssignment}
                    onChange={(e) => setFormData({ ...formData, allowSelfAssignment: e.target.checked })}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                  />
                </label>
              </div>

            </form>

            {/* Actions - Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-4 rounded-b-3xl flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                form="team-form"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg shadow-teal-500/30 font-medium"
              >
                <Save className="w-5 h-5" />
                <span>{editingTeam ? 'Update' : 'Create'} Team</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members Management Modal */}
      {showMembersModal && selectedTeamForMembers && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-bold">Manage Team Members</h3>
              <p className="text-white/80 mt-1">{selectedTeamForMembers.name}</p>
            </div>

            <div className="p-8 space-y-6">
              {/* Current Members */}
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-4">
                  Current Members ({selectedTeamForMembers.members.length}/{selectedTeamForMembers.settings.maxMembers})
                </h4>
                <div className="space-y-2">
                  {selectedTeamForMembers.members.map(member => (
                    <div key={member._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-medium text-slate-800">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>
                      <button
                        onClick={() => removeMember(selectedTeamForMembers._id, member._id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span className="text-sm font-medium">Remove</span>
                      </button>
                    </div>
                  ))}
                  {selectedTeamForMembers.members.length === 0 && (
                    <p className="text-center text-slate-400 py-8">No members in this team yet</p>
                  )}
                </div>
              </div>

              {/* Available Users */}
              {selectedTeamForMembers.members.length < selectedTeamForMembers.settings.maxMembers && (
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Add Members</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableUsers.map(user => (
                      <div key={user._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-medium text-slate-800">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                        <button
                          onClick={() => addMember(selectedTeamForMembers._id, user._id)}
                          className="flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="text-sm font-medium">Add</span>
                        </button>
                      </div>
                    ))}
                    {availableUsers.length === 0 && (
                      <p className="text-center text-slate-400 py-8">No available users to add</p>
                    )}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    setShowMembersModal(false);
                    setSelectedTeamForMembers(null);
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
