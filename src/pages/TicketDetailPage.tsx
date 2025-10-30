import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle,
  Eye,
  AlertCircle,
  Clock,
  PlayCircle,
  Pause,
  FileText,
  Paperclip,
  Download,
  Star
} from 'lucide-react';
import api from '../api/client';
import MentionInput from '../components/ui/MentionInput';
import SLATimer from '../components/SLATimer';

interface Comment {
  _id: string;
  author: {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    username: string;
  };
  content: string;
  createdAt: string;
  isInternal: boolean;
}

interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  createdAt: string;
}

interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Ticket {
  _id: string;
  ticketId: string;
  title: string;
  description: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
  };
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
  };
  severityId?: {
    _id: string;
    name: string;
    level: number;
    color: string;
    description?: string;
  };
  priorityId?: {
    _id: string;
    name: string;
    level: number;
    color: string;
  };
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  productId?: {
    _id: string;
    name: string;
    color: string;
    icon: string;
  };
  featureId?: {
    _id: string;
    name: string;
  };
  categoryId?: {
    _id: string;
    name: string;
    color: string;
  };
  assignmentType?: 'none' | 'specific-user' | 'product-team' | 'department';
  assignedTo?: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  assignedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  mentionedUsers?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  assignedDepartment?: string;
  assignedProductTeam?: string;
  tags: string[];
  attachments: Array<{
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: string;
  }>;
  comments: Comment[];
  activityLog: ActivityLog[];
  dueDate?: string;
  slaResponseDue?: string;
  slaResolutionDue?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardTo, setForwardTo] = useState('');
  const [forwardType, setForwardType] = useState<'user' | 'department'>('user');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [departments] = useState(['IT', 'HR', 'Finance', 'Operations', 'Support']);

  const statusConfig = {
    open: { color: 'text-blue-600 bg-blue-100', icon: Eye, label: 'Open' },
    in_progress: { color: 'text-yellow-600 bg-yellow-100', icon: PlayCircle, label: 'In Progress' },
    resolved: { color: 'text-green-600 bg-green-100', icon: CheckCircle, label: 'Resolved' },
    closed: { color: 'text-slate-600 bg-slate-100', icon: XCircle, label: 'Closed' },
  };

  useEffect(() => {
    console.log('Ticket ID from URL params:', id);
    console.log('ID type:', typeof id);
    console.log('ID length:', id?.length);
    if (id) {
      fetchTicket();
      fetchUsers();
    }
  }, [id]);

  // Removed auto-scroll on comments change to prevent unwanted scrolling when page loads

  useEffect(() => {
    if (ticket) {
      setEditedDescription(ticket.description);
      setEditedTitle(ticket.title);
    }
  }, [ticket]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      console.log('Fetching ticket with ID:', id);
      const response = await api.get(`/tickets/${id}`);
      console.log('Ticket fetch response:', response.data);
      setTicket(response.data.data.ticket);
    } catch (error: any) {
      console.error('Error fetching ticket:', error);
      console.error('Error response:', error.response?.data);
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



  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSendingComment(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token available for comment:', !!token);
      console.log('Adding comment to ticket:', id);
      console.log('Comment data:', { content: newComment, isInternal });
      
      const response = await api.post(`/tickets/${id}/comments`, {
        content: newComment,
        isInternal,
      });
      
      // Real-time update: Add comment immediately to UI
      const newCommentData = response.data?.data || response.data;
      
      if (newCommentData && ticket) {
        // Ensure proper author data structure
        const commentWithAuthor = {
          _id: newCommentData._id || Date.now().toString(),
          content: newComment, // Use the original comment content
          isInternal: isInternal,
          createdAt: new Date().toISOString(),
          ...newCommentData,
          author: newCommentData.author || {
            _id: user?.id || '',
            id: user?.id || '',
            firstName: user?.firstName || 'Unknown',
            lastName: user?.lastName || 'User',
            fullName: user?.fullName || (user?.firstName + ' ' + user?.lastName) || 'Unknown User',
            role: user?.role || 'user'
          }
        };
        
        setTicket({
          ...ticket,
          comments: [...(ticket.comments || []), commentWithAuthor]
        });
        
        // Auto-scroll to new comment
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      } else {
        // Fallback: refresh ticket data if real-time update fails
        console.log('Real-time update failed, refreshing ticket data...');
        await fetchTicket();
      }
      
      setNewComment('');
      setIsInternal(false);
    } catch (error: any) {
      console.error('Error sending comment:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Error adding comment: ${error.response?.data?.message || error.message}`);
    } finally {
      setSendingComment(false);
    }
  };

  const updateTicketStatus = async (newStatus: string) => {
    try {
      console.log('Updating ticket status from', ticket?.status, 'to', newStatus);
      await api.put(`/tickets/${id}`, { status: newStatus });
      console.log('Status update successful');
      
      // Real-time update: Update status immediately in UI
      if (ticket) {
        setTicket({
          ...ticket,
          status: newStatus as 'open' | 'in_progress' | 'resolved' | 'closed'
        });
      }
    } catch (error: any) {
      console.error('Error updating ticket status:', error);
      alert(`Error updating status: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateDescription = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔧 Updating description...');
      console.log('Token available:', !!token);
      console.log('Updating ticket with ID:', id);
      console.log('New description:', editedDescription);
      
      const response = await api.put(`/tickets/${id}`, {
        description: editedDescription
      });
      
      console.log('✅ Description update response:', response.data);
      
      // Real-time update: Update description immediately in UI
      setTicket({ ...ticket!, description: editedDescription });
      setIsEditingDescription(false);
      
    } catch (error: any) {
      console.error('❌ Error updating description:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      alert(`Error updating description: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateTitle = async () => {
    try {
      await api.put(`/tickets/${id}`, {
        title: editedTitle
      });
      
      // Real-time update: Update title immediately in UI
      setTicket({ ...ticket!, title: editedTitle });
      setIsEditingTitle(false);
    } catch (error: any) {
      console.error('Error updating title:', error);
      console.error('Error response:', error.response?.data);
      alert(`Error updating title: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleForward = async () => {
    try {
      const updateData: any = {};
      
      if (forwardType === 'user') {
        updateData.assignee = forwardTo;
        updateData.assignmentType = 'specific-user';
      } else {
        updateData.assignedDepartment = forwardTo;
        updateData.assignmentType = 'department';
        updateData.assignee = null;
      }

      await api.put(`/tickets/${id}`, updateData);
      await fetchTicket(); // Refresh ticket data
      setShowForwardModal(false);
      setForwardTo('');
    } catch (error) {
      console.error('Error forwarding ticket:', error);
    }
  };

  // Permission checks
  const canEditDescription = () => {
    return ticket && user && (
      user.id === ticket.createdBy.id || 
      user.role === 'admin' ||
      user.role === 'agent'
    );
  };

  const canEditTitle = () => {
    return ticket && user && (
      user.id === ticket.createdBy.id || 
      user.role === 'admin' ||
      user.role === 'agent'
    );
  };

  const canForward = () => {
    return ticket && user && (
      user.role === 'admin' ||
      user.role === 'agent' ||
      (ticket.assignee && user.id === ticket.assignee.id)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4 text-center">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ticket Not Found</h2>
          <p className="text-slate-600 mb-4">The ticket you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/tickets')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
          >
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while ticket is being fetched
  if (loading || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[ticket.status].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Fixed Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/tickets')}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/50 hover:bg-white/80 border border-white/20 transition-all hover:shadow-lg"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-3">
                  <span>{ticket.ticketId}</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusConfig[ticket.status].color}`}>
                    <StatusIcon className="h-4 w-4 mr-1.5" />
                    {statusConfig[ticket.status].label}
                  </span>
                </h1>
                {isEditingTitle ? (
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-slate-600 font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none flex-1"
                  />
                  <button
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditedTitle(ticket.title);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleUpdateTitle}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <p className="text-slate-600 font-medium">{ticket.title}</p>
                  {canEditTitle() && (
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Forward Button */}
              {canForward() && (
                <button
                  onClick={() => setShowForwardModal(true)}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                >
                  <Forward className="h-4 w-4" />
                  <span>Forward</span>
                </button>
              )}
              
              {/* Status Actions */}
              <div className="flex items-center space-x-2">
                {ticket.status === 'open' && (
                  <button
                    onClick={() => updateTicketStatus('in_progress')}
                    className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>Start Work</span>
                  </button>
                )}
                
                {ticket.status === 'in_progress' && (
                  <>
                    <button
                      onClick={() => updateTicketStatus('resolved')}
                      className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Resolve</span>
                    </button>
                    <button
                      onClick={() => updateTicketStatus('open')}
                      className="flex items-center space-x-2 bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                    >
                      <Pause className="h-4 w-4" />
                      <span>Pause</span>
                    </button>
                  </>
                )}
                
                {ticket.status === 'resolved' && (
                  <>
                    {/* Only creators and admins can close resolved tickets */}
                    {user && (user.id === ticket.createdBy.id || user.role === 'admin') ? (
                      <button
                        onClick={() => updateTicketStatus('closed')}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Close Ticket</span>
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">Waiting for creator to close</span>
                    )}
                  </>
                )}
                
                {ticket.status === 'closed' && (
                  <>
                    <span className="text-green-600 font-medium mr-4">✓ Ticket Closed</span>
                    <button
                      onClick={() => updateTicketStatus('open')}
                      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                    >
                      <PlayCircle className="h-4 w-4" />
                      <span>Reopen Ticket</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          
          {/* Left Panel - Ticket Details */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200/50">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <FileText className="inline h-4 w-4 mr-2" />
                Details
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === 'comments'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <MessageCircle className="inline h-4 w-4 mr-2" />
                Comments ({ticket.comments.length})
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-6 py-4 font-semibold transition-all ${
                  activeTab === 'activity'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Clock className="inline h-4 w-4 mr-2" />
                Activity ({ticket.activityLog?.length || 0})
              </button>
            </div>

            <div className="p-8 overflow-y-auto h-full">
              {/* Details Tab Content */}
              {activeTab === 'details' && (
                <>
              {/* Product & Category Info */}
              {(ticket.productId || ticket.categoryId || ticket.featureId) && (
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200/60">
                  <div
                    className="p-3 rounded-xl text-white shadow-lg"
                    style={{ backgroundColor: ticket.productId?.color || '#6B7280' }}
                  >
                    <Tag className="h-6 w-6" />
                  </div>
                  <div>
                    {ticket.productId && <h3 className="font-bold text-slate-800">{ticket.productId.name}</h3>}
                    {ticket.featureId && <p className="text-sm text-slate-600">Feature: {ticket.featureId.name}</p>}
                    {ticket.categoryId && <p className="text-sm text-slate-600">Category: {ticket.categoryId.name}</p>}
                  </div>
                </div>
              )}

              {/* Priority & Metadata */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Severity</label>
                    {ticket.severityId ? (
                      <div 
                        className={`inline-flex items-center px-3 py-2 rounded-xl font-semibold text-white`}
                        style={{ backgroundColor: ticket.severityId.color }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {ticket.severityId.name}
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-3 py-2 rounded-xl font-semibold bg-gray-100 text-gray-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        No Severity Set
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Priority</label>
                    {ticket.priorityId ? (
                      <div 
                        className={`inline-flex items-center px-3 py-2 rounded-xl font-semibold text-white`}
                        style={{ backgroundColor: ticket.priorityId.color }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        {ticket.priorityId.name}
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-3 py-2 rounded-xl font-semibold bg-gray-100 text-gray-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        No Priority Set
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Created By</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {ticket.createdBy.firstName[0]}{ticket.createdBy.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{ticket.createdBy.fullName}</p>
                        <p className="text-xs text-slate-500 capitalize">{ticket.createdBy.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned By Section */}
                  {ticket.assignedBy && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Assigned By</label>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {ticket.assignedBy.firstName[0]}{ticket.assignedBy.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{ticket.assignedBy.firstName} {ticket.assignedBy.lastName}</p>
                          <p className="text-xs text-slate-500">{ticket.assignedBy.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mentioned Users Section */}
                  {ticket.mentionedUsers && ticket.mentionedUsers.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Mentioned ({ticket.mentionedUsers.length})
                      </label>
                      <div className="space-y-2.5 max-h-48 overflow-y-auto">
                        {/* Filter out duplicate users by _id */}
                        {Array.from(new Map(
                          ticket.mentionedUsers.map(user => [user._id, user])
                        ).values()).map((mentionedUser, index) => (
                          <div 
                            key={`mentioned-${mentionedUser._id || index}`} 
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                              {mentionedUser.firstName?.[0] || 'U'}{mentionedUser.lastName?.[0] || 'N'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {mentionedUser.firstName} {mentionedUser.lastName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{mentionedUser.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Created</label>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {ticket.assignee && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Assigned To</label>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {ticket.assignee.firstName[0]}{ticket.assignee.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{ticket.assignee.fullName}</p>
                          <p className="text-xs text-slate-500 capitalize">{ticket.assignee.role}</p>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* SLA Response Time - Shows when work starts */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">SLA Response Time</label>
                    <SLATimer
                      label="Response"
                      dueDate={ticket.slaResponseDue || undefined}
                      isCompleted={ticket.status === 'in_progress' || ticket.status === 'resolved' || ticket.status === 'closed'}
                      completedAt={ticket.status === 'in_progress' ? ticket.updatedAt : (ticket.resolvedAt || ticket.closedAt || undefined)}
                      type="response"
                      className="mb-2"
                    />
                  </div>

                  {/* SLA Resolution Time - Main SLA */}
                  {ticket.slaResolutionDue && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">SLA Resolution Time</label>
                      <SLATimer
                        label="Resolution"
                        dueDate={ticket.slaResolutionDue}
                        isCompleted={ticket.status === 'resolved' || ticket.status === 'closed'}
                        completedAt={ticket.resolvedAt || ticket.closedAt || undefined}
                        type="resolution"
                      />
                    </div>
                  )}

                  {/* Show completion timestamps for resolved/closed tickets */}
                  {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">
                        {ticket.status === 'resolved' ? 'Resolved' : 'Closed'} Date
                      </label>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(ticket.resolvedAt || ticket.closedAt || ticket.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  {canEditDescription() && !isEditingDescription && (
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  )}
                </div>
                
                {isEditingDescription ? (
                  <div className="space-y-4">
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                      placeholder="Enter ticket description..."
                    />
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setIsEditingDescription(false);
                          setEditedDescription(ticket.description);
                        }}
                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateDescription}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-slate-50 to-white p-6 rounded-2xl border border-slate-200/60">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                )}
              </div>

              {/* Tags */}
              {ticket.tags.length > 0 && (
                <div className="mb-8">
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {ticket.attachments.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">Attachments</label>
                  <div className="space-y-3">
                    {ticket.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/60"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Paperclip className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{attachment.originalName}</p>
                            <p className="text-xs text-slate-500">
                              {(attachment.size / 1024 / 1024).toFixed(2)} MB • {new Date(attachment.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </>
              )}

              {/* Comments Tab Content */}
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
                    Comments ({ticket.comments.length})
                  </h3>
                  {ticket.comments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No comments yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ticket.comments.map((comment) => (
                        <div
                          key={comment._id}
                          className={`flex space-x-4 ${comment.isInternal ? 'opacity-75' : ''}`}
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {comment.author?.firstName?.[0] || 'U'}{comment.author?.lastName?.[0] || 'N'}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-slate-800">{comment.author?.fullName || comment.author?.firstName + ' ' + comment.author?.lastName || 'Unknown User'}</p>
                                  <p className="text-xs text-slate-500 capitalize flex items-center space-x-2">
                                    <span>{comment.author?.role || 'user'}</span>
                                    {comment.isInternal && (
                                      <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                                        Internal
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <time className="text-xs text-slate-400">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </time>
                              </div>
                              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity Tab Content */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <Clock className="h-6 w-6 mr-2 text-blue-600" />
                    Activity Log ({ticket.activityLog?.length || 0})
                  </h3>
                  {!ticket.activityLog || ticket.activityLog.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No activity yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ticket.activityLog.map((activity) => (
                        <div key={activity._id} className="flex space-x-4 items-start">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                              <Clock className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-3 rounded-xl border border-green-200/60">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-medium text-slate-700">
                                    {activity.description}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    by {activity.user.firstName} {activity.user.lastName}
                                  </p>
                                  {activity.field && activity.oldValue && activity.newValue && (
                                    <div className="mt-2 text-xs text-slate-600">
                                      <span className="font-medium">{activity.field}:</span> 
                                      <span className="bg-red-100 text-red-700 px-1 rounded mx-1">{activity.oldValue}</span>
                                      →
                                      <span className="bg-green-100 text-green-700 px-1 rounded mx-1">{activity.newValue}</span>
                                    </div>
                                  )}
                                </div>
                                <time className="text-xs text-slate-400 flex-shrink-0">
                                  {new Date(activity.createdAt).toLocaleString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Chat Style Comments */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800">Comments</h3>
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                    {ticket.comments?.length || 0}
                  </span>
                </div>
                
                {/* Quick Status Change */}
                <div className="flex items-center space-x-2">
                  <StatusIcon className="h-4 w-4 text-slate-600" />
                  <select 
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(e.target.value)}
                    className="text-xs px-2 py-1 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-slate-50/30 to-white/50">
              <div className="space-y-4">
                {(!ticket.comments || ticket.comments.length === 0) ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500 text-sm">No messages yet</p>
                    <p className="text-slate-400 text-xs">Start the conversation!</p>
                  </div>
                ) : (
                  ticket.comments.filter(comment => comment && comment._id).map((comment) => (
                    <div key={comment._id} className="flex space-x-3 animate-in slide-in-from-bottom-2">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-md">
                          {comment.author?.firstName?.[0] || 'U'}{comment.author?.lastName?.[0] || 'N'}
                        </div>
                      </div>
                      
                      {/* Message Bubble */}
                      <div className="flex-1 max-w-xs">
                        <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                          comment.isInternal 
                            ? 'bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200' 
                            : 'bg-white border border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-slate-800 text-sm">
                              {comment.author?.fullName || comment.author?.firstName + ' ' + comment.author?.lastName || 'Unknown User'}
                            </p>
                            {comment.isInternal && (
                              <span className="bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                Internal
                              </span>
                            )}
                          </div>
                          
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                          
                          <p className="text-xs text-slate-400 mt-2 flex items-center space-x-1">
                            <span className="capitalize">{comment.author?.role || 'user'}</span>
                            <span>•</span>
                            <span>{new Date(comment.createdAt).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={commentsEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendComment} className="p-4 border-t border-slate-200/50 bg-white/80">
              <div className="space-y-3">
                {/* Internal Toggle */}
                <div className="flex justify-center">
                  <label className="flex items-center space-x-2 cursor-pointer bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-orange-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                    />
                    <span className="text-xs font-medium text-orange-700">Internal Only</span>
                  </label>
                </div>
                
                {/* Smart Chat Input with Mentions */}
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <MentionInput
                      value={newComment}
                      onChange={setNewComment}
                      placeholder="Type your message... Use @ to mention users or departments"
                      className="rounded-2xl bg-white shadow-sm"
                      rows={2}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newComment.trim() && !sendingComment) {
                            handleSendComment(e as any);
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!newComment.trim() || sendingComment}
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400"
                  >
                    {sendingComment ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-slate-400 text-center">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Forward Ticket</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forward To</label>
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => setForwardType('user')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      forwardType === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Specific User
                  </button>
                  <button
                    onClick={() => setForwardType('department')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                      forwardType === 'department'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Department
                  </button>
                </div>
                
                <select
                  value={forwardTo}
                  onChange={(e) => setForwardTo(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select {forwardType === 'user' ? 'a user' : 'a department'}</option>
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
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setForwardTo('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleForward}
                disabled={!forwardTo}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
              >
                Forward Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailPage;