import React, { useState, useEffect } from 'react';
import { Plus, Clock, User, AlertCircle, Trash2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Ticket {
  _id: string;
  ticketId: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  severity: 'low' | 'medium' | 'high' | 'critical'; // Legacy field
  severityId?: {
    _id: string;
    name: string;
    level: number;
    description: string;
    color: string;
  };
  priorityId?: {
    _id: string;
    name: string;
    level: number;
    description: string;
    color: string;
  };
  slaResponseDue?: string;
  slaResolutionDue?: string;
  dueDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  assignee?: {
    _id: string;
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
  productId?: {
    _id: string;
    name: string;
    abbreviation?: string;
  } | null;
  categoryId?: {
    _id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const TicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [searchParams]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      
      // Build query params from URL
      const params: any = {};
      const status = searchParams.get('status');
      const resolvedToday = searchParams.get('resolvedToday');
      const slaBreached = searchParams.get('slaBreached');
      const withinSla = searchParams.get('withinSla');
      
      if (status) {
        params.status = status;
      }
      
      if (resolvedToday === 'true') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        params.resolvedDateFrom = today.toISOString();
      }
      
      // For SLA filters, we'll need to fetch all and filter client-side
      // since backend doesn't have these filters
      
      const response = await api.get('/tickets', { params });
      if (response.data.success) {
        let filteredTickets = response.data.data.tickets || [];
        
        // Apply SLA filters client-side
        if (slaBreached === 'true' || withinSla === 'true') {
          const now = new Date();
          filteredTickets = filteredTickets.filter((ticket: Ticket) => {
            // Only check active tickets
            if (ticket.status === 'resolved' || ticket.status === 'closed') {
              return false;
            }
            
            if (!ticket.slaResolutionDue) {
              return false;
            }
            
            const deadline = new Date(ticket.slaResolutionDue);
            const isBreached = now > deadline;
            
            if (slaBreached === 'true') {
              return isBreached;
            } else if (withinSla === 'true') {
              return !isBreached;
            }
            
            return true;
          });
        }
        
        setTickets(filteredTickets);
      }
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canDeleteTickets = () => {
    return user && (
      user.role === 'super_admin' ||
      user.role === 'admin' ||
      user.permissions?.canDeleteTickets
    );
  };

  const handleSelectTicket = (ticketId: string) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(tickets.map(t => t._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTickets.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedTickets.length} ticket(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // Delete tickets one by one
      const deletePromises = selectedTickets.map(ticketId =>
        api.delete(`/tickets/${ticketId}`)
      );

      await Promise.all(deletePromises);
      
      toast.success(`Successfully deleted ${selectedTickets.length} ticket(s)`);
      setSelectedTickets([]);
      fetchTickets(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting tickets:', error);
      toast.error(error.response?.data?.message || 'Failed to delete some tickets');
    } finally {
      setIsDeleting(false);
    }
  };

  const getSeverityColor = (ticket: Ticket) => {
    // Use severityId for new system, otherwise fall back to legacy severity
    if (ticket.severityId) {
      // Map severity levels to colors (S1=Critical, S2=High, S3=Medium, S4=Low)
      switch (ticket.severityId.level) {
        case 1: return 'bg-red-50 text-red-700 border-red-200'; // S1 - Critical
        case 2: return 'bg-orange-50 text-orange-700 border-orange-200'; // S2 - High  
        case 3: return 'bg-yellow-50 text-yellow-700 border-yellow-200'; // S3 - Medium
        case 4: return 'bg-green-50 text-green-700 border-green-200'; // S4 - Low
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    }
    
    // Legacy severity color mapping
    const severity = ticket.severity;
    switch (severity) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (ticket: Ticket) => {
    if (ticket.priorityId) {
      // Map priority levels to colors (P1=Critical, P2=High, P3=Medium, P4=Low)
      switch (ticket.priorityId.level) {
        case 1: return 'bg-purple-50 text-purple-700 border-purple-200'; // P1 - Critical
        case 2: return 'bg-pink-50 text-pink-700 border-pink-200'; // P2 - High  
        case 3: return 'bg-blue-50 text-blue-700 border-blue-200'; // P3 - Medium
        case 4: return 'bg-green-50 text-green-700 border-green-200'; // P4 - Low
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const formatSLATime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    
    if (diffMs < 0) {
      // Overdue
      const absDiffMs = Math.abs(diffMs);
      const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
      const minutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));
      return { text: `Overdue by ${hours}h ${minutes}m`, isOverdue: true };
    } else {
      // Time remaining
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return { text: `${days}d ${remainingHours}h remaining`, isOverdue: false };
      } else {
        return { text: `${hours}h ${minutes}m ${seconds}s remaining`, isOverdue: false };
      }
    }
  };

  const getSLABreachStatus = (ticket: Ticket) => {
    // Only check SLA breach for resolved or closed tickets
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return null;
    }

    // Check if we have SLA due date and resolution/closed date
    const slaDate = ticket.slaResolutionDue || ticket.slaResponseDue;
    if (!slaDate) return null;

    // Use resolvedAt for resolved tickets, closedAt for closed tickets, or updatedAt as fallback
    const completionDate = ticket.resolvedAt || ticket.closedAt || ticket.updatedAt;
    if (!completionDate) return null;

    const slaDueTime = new Date(slaDate).getTime();
    const completedTime = new Date(completionDate).getTime();
    
    const wasWithinSLA = completedTime <= slaDueTime;
    const diffHours = Math.abs(Math.ceil((completedTime - slaDueTime) / (1000 * 60 * 60)));

    return {
      withinSLA: wasWithinSLA,
      text: wasWithinSLA 
        ? `Within SLA (${diffHours}h early)` 
        : `SLA Breached (${diffHours}h late)`,
      isBreached: !wasWithinSLA
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and track support tickets</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
            <p className="text-sm text-gray-600 mt-1">Manage and track support tickets</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-600">{error}</p>
          <button 
            onClick={fetchTickets}
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get active filter for display
  const getActiveFilter = () => {
    const status = searchParams.get('status');
    const resolvedToday = searchParams.get('resolvedToday');
    const slaBreached = searchParams.get('slaBreached');
    const withinSla = searchParams.get('withinSla');
    
    if (status === 'open') return '📂 Open Tickets';
    if (status === 'in_progress') return '⏳ In Progress Tickets';
    if (status === 'resolved' && resolvedToday === 'true') return '✅ Resolved Today';
    if (status === 'resolved') return '✅ Resolved Tickets';
    if (slaBreached === 'true') return '🚨 SLA Breached Tickets';
    if (withinSla === 'true') return '✅ Within SLA Tickets';
    return null;
  };

  const activeFilter = getActiveFilter();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tickets</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and track support tickets ({tickets.length} total)</p>
        </div>
        <Link
          to="/tickets/new"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Link>
      </div>

      {/* Active Filter Banner */}
      {activeFilter && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{activeFilter.split(' ')[0]}</div>
            <div>
              <p className="font-semibold text-gray-900">{activeFilter}</p>
              <p className="text-sm text-gray-600">Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Link
            to="/tickets"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
          >
            Clear Filter
          </Link>
        </div>
      )}

      {/* Tickets List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">{activeFilter || 'All Tickets'}</h3>
          
          {canDeleteTickets() && selectedTickets.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete {selectedTickets.length} Selected</span>
            </button>
          )}
        </div>
        
        {tickets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-base mb-2 text-gray-900">No tickets found</p>
            <p className="text-sm text-gray-600 mb-4">Get started by creating your first ticket.</p>
            <Link
              to="/tickets/new"
              className="btn-secondary"
            >
              Create Ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {canDeleteTickets() && (
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedTickets.length === tickets.length && tickets.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      SLA Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.filter(ticket => ticket && ticket._id).map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
                      {canDeleteTickets() && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedTickets.includes(ticket._id)}
                            onChange={() => handleSelectTicket(ticket._id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                          />
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/tickets/${ticket.ticketId || ticket._id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          {ticket.ticketId || ticket._id?.substring(0, 8) || 'Unknown'}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {ticket.title}
                        </div>
                        {ticket.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {ticket.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ticket.productId?.name || 'Unknown Product'}
                        </div>
                        {ticket.categoryId?.name && (
                          <div className="text-sm text-gray-500">{ticket.categoryId.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getSeverityColor(ticket)}`}>
                          {ticket.severityId?.name || ticket.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.priorityId ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getPriorityColor(ticket)}`}>
                            {ticket.priorityId.name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No Priority</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          // For completed tickets, show SLA breach status
                          if (ticket.status === 'resolved' || ticket.status === 'closed') {
                            const breachStatus = getSLABreachStatus(ticket);
                            if (!breachStatus) return <span className="text-xs text-gray-400">No SLA</span>;
                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                                breachStatus.withinSLA ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                                {breachStatus.withinSLA ? '✅' : '❌'} {breachStatus.text}
                              </span>
                            );
                          }
                          
                          // For active tickets, show remaining time based on Resolution SLA
                          const slaInfo = formatSLATime(ticket.slaResolutionDue);
                          if (!slaInfo) return <span className="text-xs text-gray-400">No SLA</span>;
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                              slaInfo.isOverdue ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {slaInfo.text}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.createdBy?.firstName || 'Unknown'} {ticket.createdBy?.lastName || 'User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ticket.createdBy?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.assignee ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6">
                              <div className="h-6 w-6 rounded-full bg-blue-300 flex items-center justify-center">
                                <User className="h-3 w-3 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-2">
                              <div className="text-xs font-medium text-gray-900">
                                {ticket.assignee.firstName} {ticket.assignee.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(ticket.assignee as any).email || 'Assigned'}
                              </div>
                            </div>
                          </div>
                        ) : ticket.mentionedUsers && ticket.mentionedUsers.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {ticket.mentionedUsers.map((mentionedUser: any, idx: number) => (
                              <div key={idx} className="flex items-center">
                                <div className="flex-shrink-0 h-6 w-6">
                                  <div className="h-6 w-6 rounded-full bg-purple-300 flex items-center justify-center">
                                    <User className="h-3 w-3 text-purple-600" />
                                  </div>
                                </div>
                                <div className="ml-2">
                                  <div className="text-xs font-medium text-gray-900">
                                    {mentionedUser.firstName} {mentionedUser.lastName}
                                  </div>
                                  <div className="text-xs text-purple-600">
                                    {mentionedUser.email}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(ticket.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;