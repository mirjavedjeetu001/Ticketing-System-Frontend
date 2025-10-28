import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft,
  Edit2,
  Save,
  X,
  MessageCircle,
  Send,
  Forward,
  XCircle,
  User,
  Tag,
  Calendar,
  AlertTriangle,
  Play,
  CheckCircle,
  Eye
} from 'lucide-react';
import api from '../api/client';

interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignmentType: 'none' | 'specific-user' | 'product-team' | 'department';
  assignedTo?: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  assignedDepartment?: string;
  assignedProductTeam?: string;
  createdBy: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  product?: {
    _id: string;
    name: string;
  };
  feature?: {
    _id: string;
    name: string;
  };
  category?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardTo, setForwardTo] = useState('');
  const [forwardType, setForwardType] = useState<'user' | 'department'>('user');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [departments] = useState(['IT', 'HR', 'Finance', 'Operations', 'Support']);

  useEffect(() => {
    fetchTicketDetails();
    fetchComments();
    fetchUsers();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
      setEditedDescription(response.data.description);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/tickets/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setAvailableUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/tickets/${id}/comments`, {
        content: newComment
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleUpdateDescription = async () => {
    try {
      await api.patch(`/tickets/${id}`, {
        description: editedDescription
      });
      setTicket({ ...ticket!, description: editedDescription });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const handleStartWork = async () => {
    try {
      await api.patch(`/tickets/${id}`, {
        status: 'in_progress',
        assignedTo: user?._id
      });
      setTicket({ ...ticket!, status: 'in_progress' });
    } catch (error) {
      console.error('Error starting work:', error);
    }
  };

  const handleForward = async () => {
    try {
      const updateData: any = {};
      
      if (forwardType === 'user') {
        updateData.assignedTo = forwardTo;
        updateData.assignmentType = 'specific-user';
      } else {
        updateData.assignedDepartment = forwardTo;
        updateData.assignmentType = 'department';
        updateData.assignedTo = null;
      }

      await api.patch(`/tickets/${id}`, updateData);
      await fetchTicketDetails(); // Refresh ticket data
      setShowForwardModal(false);
      setForwardTo('');
    } catch (error) {
      console.error('Error forwarding ticket:', error);
    }
  };

  const handleClose = async () => {
    try {
      await api.patch(`/tickets/${id}`, {
        status: 'closed'
      });
      setTicket({ ...ticket!, status: 'closed' });
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  // Permission checks
  const canEditDescription = () => {
    return ticket && user && (
      user._id === ticket.createdBy._id || 
      user.role === 'admin' ||
      user.role === 'agent'
    );
  };

  const canStartWork = () => {
    return ticket && user && ticket.status === 'open' && (
      user.role === 'admin' ||
      user.role === 'agent' ||
      (ticket.assignedTo && user._id === ticket.assignedTo._id)
    );
  };

  const canForward = () => {
    return ticket && user && (
      user.role === 'admin' ||
      user.role === 'agent' ||
      (ticket.assignedTo && user._id === ticket.assignedTo._id)
    );
  };

  const canClose = () => {
    return ticket && user && (
      user.role === 'admin' ||
      user.role === 'agent' ||
      (ticket.assignedTo && user._id === ticket.assignedTo._id)
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{ticket.title}</h1>
              <p className="text-gray-600 mt-1">#{ticket._id.slice(-6).toUpperCase()}</p>
            </div>
            
            <div className="flex space-x-3">
              {canStartWork() && (
                <button
                  onClick={handleStartWork}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Work
                </button>
              )}
              
              {canForward() && (
                <button
                  onClick={() => setShowForwardModal(true)}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </button>
              )}
              
              {canClose() && ticket.status !== 'closed' && (
                <button
                  onClick={handleClose}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Close Ticket
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Ticket Details</h2>
                {canEditDescription() && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={6}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedDescription(ticket.description);
                          }}
                          className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateDescription}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Comments ({comments.length})
              </h2>

              {/* Comments List */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                          {comment.author.firstName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {comment.author.firstName} {comment.author.lastName}
                          </p>
                          <p className="text-sm text-gray-500">@{comment.author.username}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="border-t pt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Priority */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Status & Priority</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Assignment</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-900 capitalize">{ticket.assignmentType.replace('-', ' ')}</p>
                </div>
                {ticket.assignedTo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span>{ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                    </div>
                  </div>
                )}
                {ticket.assignedDepartment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <p className="text-gray-900">{ticket.assignedDepartment}</p>
                  </div>
                )}
                {ticket.assignedProductTeam && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Team</label>
                    <p className="text-gray-900">{ticket.assignedProductTeam}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Classification */}
            {(ticket.product || ticket.feature || ticket.category) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Classification</h3>
                <div className="space-y-3">
                  {ticket.product && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{ticket.product.name}</span>
                      </div>
                    </div>
                  )}
                  {ticket.feature && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Feature</label>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{ticket.feature.name}</span>
                      </div>
                    </div>
                  )}
                  {ticket.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{ticket.category.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated</label>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{ticket.createdBy.firstName} {ticket.createdBy.lastName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Forward Ticket</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Forward To</label>
              <div className="flex space-x-4 mb-3">
                <button
                  onClick={() => setForwardType('user')}
                  className={`px-4 py-2 rounded-lg ${forwardType === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  User
                </button>
                <button
                  onClick={() => setForwardType('department')}
                  className={`px-4 py-2 rounded-lg ${forwardType === 'department' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Department
                </button>
              </div>
              
              <select
                value={forwardTo}
                onChange={(e) => setForwardTo(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select {forwardType}</option>
                {forwardType === 'user' ? (
                  availableUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName} (@{u.username})
                    </option>
                  ))
                ) : (
                  departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowForwardModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleForward}
                disabled={!forwardTo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Forward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;