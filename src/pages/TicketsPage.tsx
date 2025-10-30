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

      {/* Tickets List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-900">All Tickets</h3>
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
                          
                          // For active tickets, show remaining time
                          const slaInfo = formatSLATime(ticket.slaResponseDue);
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