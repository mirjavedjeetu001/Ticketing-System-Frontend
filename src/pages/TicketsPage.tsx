import React, { useState, useEffect } from 'react';
import { Plus, Clock, User, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets');
      if (response.data.success) {
        setTickets(response.data.data.tickets || []);
      }
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (ticket: Ticket) => {
    // Use severityId for new system, otherwise fall back to legacy severity
    if (ticket.severityId) {
      // Map severity levels to colors (S1=Critical, S2=High, S3=Medium, S4=Low)
      switch (ticket.severityId.level) {
        case 1: return 'bg-red-100 text-red-800'; // S1 - Critical
        case 2: return 'bg-orange-100 text-orange-800'; // S2 - High  
        case 3: return 'bg-yellow-100 text-yellow-800'; // S3 - Medium
        case 4: return 'bg-green-100 text-green-800'; // S4 - Low
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Legacy severity color mapping
    const severity = ticket.severity;
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (ticket: Ticket) => {
    if (ticket.priorityId) {
      // Map priority levels to colors (P1=Critical, P2=High, P3=Medium, P4=Low)
      switch (ticket.priorityId.level) {
        case 1: return 'bg-purple-100 text-purple-800'; // P1 - Critical
        case 2: return 'bg-pink-100 text-pink-800'; // P2 - High  
        case 3: return 'bg-blue-100 text-blue-800'; // P3 - Medium
        case 4: return 'bg-green-100 text-green-800'; // P4 - Low
        default: return 'bg-gray-100 text-gray-800';
      }
    }
    return 'bg-gray-100 text-gray-800';
  };

  const formatSLATime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) {
      return { text: `Overdue by ${Math.abs(diffHours)}h`, isOverdue: true };
    } else if (diffHours < 24) {
      return { text: `${diffHours}h remaining`, isOverdue: false };
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return { text: `${diffDays}d remaining`, isOverdue: false };
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
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
            <p className="text-gray-600">Manage and track support tickets</p>
          </div>
        </div>
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
            <p className="text-gray-600">Manage and track support tickets</p>
          </div>
        </div>
        <div className="glass-card p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Manage and track support tickets ({tickets.length} total)</p>
        </div>
        <Link
          to="/tickets/new"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Link>
      </div>

      {/* Tickets List */}
      <div className="glass-card">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-medium">All Tickets</h3>
        </div>
        
        {tickets.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-300 mb-4">📄</div>
            <p className="text-lg mb-2">No tickets found</p>
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
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/5">
                  <tr>
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
                <tbody className="divide-y divide-white/10">
                  {tickets.filter(ticket => ticket && ticket._id).map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/tickets/${ticket.ticketId || ticket._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(ticket)}`}>
                          {ticket.severityId?.name || ticket.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.priorityId ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket)}`}>
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
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                breachStatus.withinSLA ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {breachStatus.withinSLA ? '✅' : '❌'} {breachStatus.text}
                              </span>
                            );
                          }
                          
                          // For active tickets, show remaining time
                          const slaInfo = formatSLATime(ticket.slaResponseDue);
                          if (!slaInfo) return <span className="text-xs text-gray-400">No SLA</span>;
                          return (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              slaInfo.isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
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