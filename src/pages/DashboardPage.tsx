import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, Clock, CheckCircle, Plus, Activity,
  AlertTriangle
} from 'lucide-react';
import api from '../api/client';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'ticket_created' | 'ticket_resolved' | 'comment_added';
  title: string;
  description: string;
  time: string;
  user: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { name: 'Open Tickets', value: '0', icon: Ticket },
    { name: 'In Progress', value: '0', icon: Clock },
    { name: 'Resolved Today', value: '0', icon: CheckCircle },
    { name: 'SLA Breached', value: '0', icon: AlertTriangle },
    { name: 'Within SLA', value: '0', icon: CheckCircle },
  ]);
  const [productStats, setProductStats] = useState<Array<{
    product: Product;
    open: number;
    inProgress: number;
    resolved: number;
  }>>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      fetchDashboardStats();
    } else {
      // Fetch general stats even without products
      fetchDashboardStats();
    }
  }, [products]);

  const fetchMyProducts = async () => {
    try {
      const response = await api.get('/products/my-products');
      setProducts(response.data.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch all data in parallel for better performance
      const [ticketsStatsResponse, allTicketsResponse] = await Promise.all([
        api.get('/tickets/stats'),
        api.get('/tickets', { params: { limit: 1000 } }) // Fetch recent tickets for calculations
      ]);

      const ticketStats = ticketsStatsResponse.data.data.stats;
      const allTickets = allTicketsResponse.data.data?.tickets || [];
      
      // Calculate metrics from the tickets we already fetched
      let slaBreached = 0;
      let withinSla = 0;
      let resolvedToday = 0;
      const now = new Date();
      
      allTickets.forEach((ticket: any) => {
        // Count resolved today
        if ((ticket.status === 'resolved' || ticket.status === 'closed') && ticket.resolvedAt) {
          const resolvedDate = new Date(ticket.resolvedAt);
          if (resolvedDate >= today) {
            resolvedToday++;
          }
        }
        
        // Calculate SLA for active tickets only (using slaResolutionDue field)
        if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
          if (ticket.slaResolutionDue) {
            const deadline = new Date(ticket.slaResolutionDue);
            if (now > deadline) {
              slaBreached++;
            } else {
              withinSla++;
            }
          }
        }
      });

      setStats([
        { 
          name: 'Open Tickets', 
          value: String(ticketStats.open || 0), 
          icon: Ticket, 
        },
        { 
          name: 'In Progress', 
          value: String(ticketStats.inProgress || 0), 
          icon: Clock, 
        },
        { 
          name: 'Resolved Today', 
          value: String(resolvedToday), 
          icon: CheckCircle, 
        },
        { 
          name: 'SLA Breached', 
          value: String(slaBreached), 
          icon: AlertTriangle, 
        },
        { 
          name: 'Within SLA', 
          value: String(withinSla), 
          icon: CheckCircle, 
        },
      ]);

      // Fetch product-wise stats with staggered requests to avoid rate limiting
      if (products.length > 0) {
        const productStatsData: Array<{
          product: Product;
          open: number;
          inProgress: number;
          resolved: number;
        }> = [];

        // Fetch sequentially with small delay to prevent rate limiting
        for (const product of products) {
          try {
            const response = await api.get('/tickets/stats', {
              params: { product: product._id }
            });
            const stats = response.data.data.stats;
            productStatsData.push({
              product,
              open: stats.open || 0,
              inProgress: stats.inProgress || 0,
              resolved: stats.resolved || 0,
            });
          } catch (error) {
            productStatsData.push({
              product,
              open: 0,
              inProgress: 0,
              resolved: 0,
            });
          }
          
          // Small delay between requests (let the interceptor handle throttling)
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setProductStats(productStatsData);
      }

      // Set recent activities from actual tickets
      const recentTickets = allTickets
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      const activities = recentTickets.map((ticket: any) => {
        const createdDate = new Date(ticket.createdAt);
        const diffMs = now.getTime() - createdDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo = '';
        if (diffMins < 1) timeAgo = 'Just now';
        else if (diffMins < 60) timeAgo = `${diffMins} min ago`;
        else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        else timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return {
          id: ticket._id,
          type: ticket.status === 'resolved' ? 'ticket_resolved' : 'ticket_created',
          title: ticket.status === 'resolved' ? 'Ticket resolved' : 'New ticket created',
          description: ticket.title,
          time: timeAgo,
          user: ticket.createdBy?.firstName + ' ' + ticket.createdBy?.lastName || 'Unknown User',
        };
      });

      setRecentActivities(activities);
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket_created': return <Plus className="w-4 h-4" />;
      case 'ticket_resolved': return <CheckCircle className="w-4 h-4" />;
      case 'comment_added': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/60 p-6 space-y-6">
      {/* Welcome Header with Premium Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.firstName} 👋
            </h1>
            <p className="text-blue-100 text-base">
              Here's what's happening with your tickets today
            </p>
          </div>
          <button 
            onClick={() => navigate('/tickets/new')}
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-xl shadow-lg font-semibold hover:bg-blue-50 transition-all hover:scale-105 hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Stats Grid with Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const gradientColors = [
            'from-blue-500 to-blue-600',
            'from-amber-500 to-orange-600',
            'from-green-500 to-emerald-600',
            'from-red-500 to-red-600',
            'from-emerald-500 to-teal-600'
          ];
          const bgColors = [
            'bg-gradient-to-br from-blue-50 to-blue-100/50',
            'bg-gradient-to-br from-amber-50 to-orange-100/50',
            'bg-gradient-to-br from-green-50 to-emerald-100/50',
            'bg-gradient-to-br from-red-50 to-red-100/50',
            'bg-gradient-to-br from-emerald-50 to-teal-100/50'
          ];
          const index = stats.indexOf(stat);
          
          // Determine filter parameters based on stat name
          const getFilterParams = () => {
            switch (stat.name) {
              case 'Open Tickets':
                return '?status=open';
              case 'In Progress':
                return '?status=in_progress';
              case 'Resolved Today':
                return '?status=resolved&resolvedToday=true';
              case 'SLA Breached':
                return '?slaBreached=true';
              case 'Within SLA':
                return '?withinSla=true';
              default:
                return '';
            }
          };
          
          return (
            <button
              key={stat.name}
              onClick={() => navigate(`/tickets${getFilterParams()}`)}
              className={`relative overflow-hidden ${bgColors[index]} backdrop-blur-xl rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all hover:scale-105 border border-white/40 cursor-pointer text-left w-full`}
            >
              {/* Decorative circle */}
              <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${gradientColors[index]} opacity-20 rounded-full blur-2xl`}></div>
              
              <div className="relative">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-4 bg-gradient-to-br ${gradientColors[index]} rounded-xl shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600 mb-2">{stat.name}</p>
                  <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Product-wise Ticket Stats */}
      {productStats.length > 0 && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <span className="mr-3 text-3xl">📊</span>
              Product-wise Ticket Statistics
            </h2>
            <p className="text-sm text-slate-600 mt-2">Ticket status breakdown by product</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productStats.map((productStat, index) => {
                const cardGradients = [
                  'from-blue-500 to-indigo-600',
                  'from-purple-500 to-pink-600',
                  'from-green-500 to-teal-600',
                  'from-orange-500 to-red-600',
                  'from-cyan-500 to-blue-600',
                  'from-amber-500 to-orange-600'
                ];
                const gradient = cardGradients[index % cardGradients.length];
                const total = productStat.open + productStat.inProgress + productStat.resolved;

                return (
                  <div 
                    key={productStat.product._id}
                    className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 backdrop-blur-xl rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all hover:scale-105 border border-white/40"
                  >
                    {/* Decorative gradient overlay */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl`}></div>
                    
                    <div className="relative">
                      {/* Product Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg`}>
                          <div className="text-2xl text-white">
                            {productStat.product.icon === 'Globe' ? '🌐' : 
                             productStat.product.icon === 'Smartphone' ? '📱' : 
                             productStat.product.icon === 'Server' ? '🖥️' : 
                             productStat.product.icon === 'Headphones' ? '🎧' : 
                             productStat.product.icon === 'CreditCard' ? '💳' : '📦'}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{productStat.product.name}</h3>
                          <p className="text-xs text-slate-500">{productStat.product.category}</p>
                        </div>
                      </div>

                      {/* Total Tickets */}
                      <div className="mb-4 p-3 bg-white/60 rounded-xl">
                        <p className="text-sm font-semibold text-slate-600">Total Tickets</p>
                        <p className="text-2xl font-bold text-slate-900">{total}</p>
                      </div>

                      {/* Stats Breakdown */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-blue-50/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium text-slate-700">Open</span>
                          </div>
                          <span className="text-sm font-bold text-blue-600">{productStat.open}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-amber-50/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className="text-sm font-medium text-slate-700">In Progress</span>
                          </div>
                          <span className="text-sm font-bold text-amber-600">{productStat.inProgress}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-green-50/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-slate-700">Resolved</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">{productStat.resolved}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Available Products - Premium Design */}
        <div className="xl:col-span-2">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200/60">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <span className="mr-3 text-3xl">📦</span>
                Available Products
              </h2>
              <p className="text-sm text-slate-600 mt-2">Click on a product to create a ticket</p>
            </div>
            
            <div className="p-8">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 blur-xl"></div>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-6 animate-bounce">📦</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Available</h3>
                  <p className="text-slate-600 mb-6">
                    Contact your administrator to get access to products.
                  </p>
                  <div className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl font-semibold">
                    Contact Support
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product, index) => {
                    const cardGradients = [
                      'from-blue-500 to-indigo-600',
                      'from-purple-500 to-pink-600',
                      'from-green-500 to-teal-600',
                      'from-orange-500 to-red-600',
                      'from-cyan-500 to-blue-600',
                      'from-amber-500 to-orange-600'
                    ];
                    const gradient = cardGradients[index % cardGradients.length];
                    
                    return (
                      <button
                        key={product._id}
                        className="group relative text-left p-6 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 rounded-2xl border border-slate-200/60 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
                        onClick={() => navigate('/tickets/new', { 
                          state: { productId: product._id, productName: product.name } 
                        })}
                      >
                        {/* Decorative gradient overlay */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 rounded-full blur-2xl transition-opacity`}></div>
                        
                        <div className="relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-4 bg-gradient-to-br ${gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                              <div className="text-3xl text-white">
                                {product.icon === 'Globe' ? '🌐' : 
                                 product.icon === 'Smartphone' ? '📱' : 
                                 product.icon === 'Server' ? '🖥️' : 
                                 product.icon === 'Headphones' ? '🎧' : 
                                 product.icon === 'CreditCard' ? '💳' : '📦'}
                              </div>
                            </div>
                            <div className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 shadow-sm">
                              {product.category}
                            </div>
                          </div>
                          <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions - Premium Design */}
        <div className="xl:col-span-1 space-y-6">
          {/* Recent Activity */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50/50 border-b border-purple-200/60">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                <Activity className="h-6 w-6 mr-3 text-purple-600" />
                Recent Activity
              </h3>
            </div>
            
            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-slate-100">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600"></div>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm text-slate-600">No recent activity</p>
                </div>
              ) : (
                recentActivities.map((activity, index) => {
                  const iconGradients = [
                    'from-blue-500 to-indigo-600',
                    'from-green-500 to-emerald-600',
                    'from-purple-500 to-pink-600'
                  ];
                  const gradient = iconGradients[index % iconGradients.length];
                  
                  return (
                    <div 
                      key={activity.id} 
                      className="group flex items-start space-x-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-200/60 hover:border-blue-300 hover:shadow-lg transition-all"
                    >
                      <div className={`flex-shrink-0 p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-md text-white group-hover:scale-110 transition-transform`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50">
                          <p className="text-xs font-medium text-slate-500 truncate mr-2">by {activity.user}</p>
                          <p className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200/60 bg-slate-50/50">
              <button 
                onClick={() => navigate('/tickets')}
                className="w-full text-center py-3 text-sm font-bold text-blue-600 hover:text-blue-700 bg-white rounded-xl hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
              >
                View All Activity →
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <span className="mr-3 text-3xl">⚡</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/tickets/new')}
                className="group w-full text-left px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-2xl hover:scale-105 font-bold text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                    Create New Ticket
                  </span>
                  <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">✨</span>
                </div>
              </button>
              <button 
                onClick={() => navigate('/tickets')}
                className="group w-full text-left px-6 py-4 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 rounded-2xl hover:from-slate-200 hover:to-slate-300 transition-all shadow-md hover:shadow-lg hover:scale-105 font-bold text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Ticket className="w-5 h-5 mr-3" />
                    View All Tickets
                  </span>
                  <span className="text-xl">📋</span>
                </div>
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="group w-full text-left px-6 py-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-2xl hover:from-purple-200 hover:to-pink-200 transition-all shadow-md hover:shadow-lg hover:scale-105 font-bold text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="text-xl mr-3">👥</span>
                      Admin Panel
                    </span>
                    <span className="text-xl">⚙️</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
