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
  Clock,
  User,
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Play
} from 'lucide-react';
import api from '../api/client';

interface TicketDetails {
  _id: string;
  ticketId: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignee?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  productId: {
    _id: string;
    name: string;
    abbreviation: string;
  };
  categoryId: {
    _id: string;
    name: string;
    color: string;
  };
  severityId: {
    _id: string;
    name: string;
    level: string;
    color: string;
  };
  priorityId: {
    _id: string;
    name: string;
    level: string;
    color: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  comments: Array<{
    _id: string;
    author: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    content: string;
    createdAt: string;
    isInternal: boolean;
  }>;
  assignToProductTeam: boolean;
  assignedDepartmentId?: {
    _id: string;
    name: string;
  };
}

const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [workStarted, setWorkStarted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
      fetchUsers();
    }
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data.data.ticket);
      setEditedDescription(response.data.data.ticket.description || '');
      setWorkStarted(response.data.data.ticket.status === 'in_progress');
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const allUsers = response.data.data?.users || response.data.users || [];
      // Filter to show agents and admins for assignment
      const assignableUsers = allUsers.filter((u: any) => 
        ['agent', 'admin'].includes(u.role)
      );
      setUsers(assignableUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const canEditDescription = () => {
    if (!ticket || !user) return false;
    return ticket.createdBy._id === user.id || user.role === 'admin';
  };

  const canStartWork = () => {
    if (!ticket || !user) return false;
    if (user.role === 'admin') return true;
    if (ticket.assignee && ticket.assignee._id === user.id) return true;
    // Check if user is part of assigned department or product team
    return false;
  };

  const canForward = () => {
    if (!ticket || !user) return false;
    return ['agent', 'admin'].includes(user.role);
  };

  const canClose = () => {
    if (!ticket || !user) return false;
    return ticket.createdBy._id === user.id || user.role === 'admin';
  };

  const handleUpdateDescription = async () => {
    if (!ticket) return;
    
    try {
      await api.put(`/tickets/${ticket._id}`, {
        description: editedDescription
      });
      
      setTicket(prev => prev ? { ...prev, description: editedDescription } : null);
      setEditingDescription(false);
    } catch (error) {
      console.error('Error updating description:', error);
      alert('Failed to update description');
    }
  };

  const handleAddComment = async () => {
    if (!ticket || !newComment.trim()) return;
    
    try {
      setAddingComment(true);
      await api.post(`/tickets/${ticket._id}/comments`, {
        content: newComment,
        isInternal: false
      });
      
      setNewComment('');
      fetchTicketDetails(); // Refresh to show new comment
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const handleStartWork = async () => {
    if (!ticket) return;
    
    try {
      await api.put(`/tickets/${ticket._id}`, {
        status: 'in_progress'
      });
      
      setWorkStarted(true);
      setTicket(prev => prev ? { ...prev, status: 'in_progress' } : null);
    } catch (error) {
      console.error('Error starting work:', error);
      alert('Failed to start work');
    }
  };

  const handleForward = async () => {
    if (!ticket || !selectedAssignee) return;
    
    try {
      await api.put(`/tickets/${ticket._id}`, {
        assignee: selectedAssignee
      });
      
      setShowForwardModal(false);
      fetchTicketDetails(); // Refresh ticket details
      alert('Ticket forwarded successfully');
    } catch (error) {
      console.error('Error forwarding ticket:', error);
      alert('Failed to forward ticket');
    }
  };

  const handleClose = async () => {
    if (!ticket) return;
    
    const confirmed = confirm('Are you sure you want to close this ticket?');
    if (!confirmed) return;
    
    try {
      await api.put(`/tickets/${ticket._id}`, {
        status: 'closed'
      });
      
      setTicket(prev => prev ? { ...prev, status: 'closed' } : null);
      alert('Ticket closed successfully');
    } catch (error) {
      console.error('Error closing ticket:', error);
      alert('Failed to close ticket');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ticket not found</h2>
          <button
            onClick={() => navigate('/tickets')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tickets
          </button>
          
          <div className="flex space-x-2">
            {canStartWork() && ticket.status === 'open' && (
              <button
                onClick={handleStartWork}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Work
              </button>
            )}
            
            {canForward() && (
              <button
                onClick={() => setShowForwardModal(true)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
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
                Close
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {ticket.ticketId} - {ticket.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Description</h3>
                {canEditDescription() && !editingDescription && (
                  <button
                    onClick={() => setEditingDescription(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {editingDescription ? (
                <div className="space-y-3">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ticket description..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateDescription}
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingDescription(false);
                        setEditedDescription(ticket.description || '');
                      }}
                      className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {ticket.description || 'No description provided'}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Ticket Info */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Ticket Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Created by</p>
                    <p className="text-sm font-medium">{ticket.createdBy.firstName} {ticket.createdBy.lastName}</p>
                  </div>
                </div>
                
                {ticket.assignee && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Assigned to</p>
                      <p className="text-sm font-medium">{ticket.assignee.firstName} {ticket.assignee.lastName}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="text-sm font-medium">{ticket.productId.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="text-sm font-medium">{ticket.categoryId.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Severity</p>
                    <p className="text-sm font-medium" style={{ color: ticket.severityId.color }}>
                      {ticket.severityId.name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm font-medium">{formatDate(ticket.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Comments ({ticket.comments.length})
          </h3>
        </div>

        {/* Comments List */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {ticket.comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          ) : (
            ticket.comments.map((comment) => (
              <div key={comment._id} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {comment.author.firstName} {comment.author.lastName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="border-t pt-4">
          <div className="flex space-x-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || addingComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Forward Ticket</h3>
              <button
                onClick={() => setShowForwardModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to
              </label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select user...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} - {user.role}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowForwardModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForward}
                disabled={!selectedAssignee}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
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

export default TicketDetailsPage;