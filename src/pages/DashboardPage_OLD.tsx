import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, Users, Clock, CheckCircle, Plus, Globe, Smartphone, Server, 
  Headphones, CreditCard, TrendingUp, Activity, 
  Calendar, Bell, Star, Zap, ArrowRight, BarChart3, Target
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
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap: { [key: string]: any } = {
    Globe,
    Smartphone,
    Server,
    Headphones,
    CreditCard,
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

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

  const stats = [
    { 
      name: 'Open Tickets', 
      value: '12', 
      change: '+2.5%',
      trend: 'up',
      icon: Ticket, 
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100' 
    },
    { 
      name: 'In Progress', 
      value: '8', 
      change: '-1.2%',
      trend: 'down',
      icon: Clock, 
      gradient: 'from-yellow-500 to-amber-500',
      bgGradient: 'from-yellow-50 to-amber-100' 
    },
    { 
      name: 'Resolved Today', 
      value: '24', 
      change: '+12.3%',
      trend: 'up',
      icon: CheckCircle, 
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-100' 
    },
    { 
      name: 'Total Users', 
      value: '156', 
      change: '+5.7%',
      trend: 'up',
      icon: Users, 
      gradient: 'from-purple-500 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-100' 
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'ticket_created',
      title: 'New High Priority Ticket',
      description: 'Server downtime issue reported for Web Application',
      time: '5 min ago',
      user: 'John Doe',
      priority: 'high'
    },
    {
      id: '2',
      type: 'ticket_resolved',
      title: 'Ticket Resolved',
      description: 'Mobile app login issue has been fixed',
      time: '12 min ago',
      user: 'Sarah Johnson',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'comment_added',
      title: 'New Comment Added',
      description: 'Technical team provided update on database optimization',
      time: '25 min ago',
      user: 'Mike Wilson',
      priority: 'low'
    },
    {
      id: '4',
      type: 'ticket_created',
      title: 'Critical Bug Report',
      description: 'Payment processing failure in production',
      time: '1 hour ago',
      user: 'Emma Davis',
      priority: 'critical'
    }
  ];

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="p-6 space-y-6">
      {/* Welcome Header with Premium Design */}
      <div className="relative">
        <div className="glass-light rounded-3xl p-8 border border-white/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold gradient-text-blue animate-slide-in-up">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-slate-600 text-lg animate-slide-in-up" style={{animationDelay: '0.1s'}}>
                Manage your tickets and track progress with our premium dashboard
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4 animate-fade-in-scale" style={{animationDelay: '0.2s'}}>
              <button 
                onClick={() => navigate('/tickets/new')}
                className="btn-ripple bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover-lift flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Ticket</span>
              </button>
              <button className="glass-light border border-white/30 text-slate-700 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover-lift flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-15 animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name} 
              className="relative group animate-slide-in-up hover-lift"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className={`glass-light rounded-2xl p-6 border border-white/20 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:border-white/40 bg-gradient-to-br ${stat.bgGradient} hover-glow`}>
                {/* Icon with Gradient Background */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg animate-glow`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                    <span>{stat.change}</span>
                  </div>
                </div>

                {/* Stats Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-600 uppercase tracking-wider">{stat.name}</h3>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Available Products - Takes 2 columns on large screens */}
        <div className="xl:col-span-2 space-y-6">
          <div className="glass-light rounded-2xl border border-white/20 backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold gradient-text-blue">Available Products</h2>
                  <p className="text-slate-600 mt-1">Create tickets for the products you have access to</p>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <button className="glass-light border border-white/30 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover-lift text-sm">
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Analytics
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="loading-dots text-blue-600">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product, index) => {
                    const Icon = iconMap[product.icon] || Server;
                    return (
                      <div
                        key={product._id}
                        className="group relative glass-light border border-white/30 rounded-xl p-6 hover-lift hover:shadow-2xl transition-all duration-500 cursor-pointer animate-slide-in-up hover-glow"
                        style={{animationDelay: `${index * 0.1}s`}}
                        onClick={() => navigate('/tickets/new', { state: { productId: product._id, productName: product.name } })}
                      >
                        {/* Product Icon */}
                        <div className="flex items-start justify-between mb-4">
                          <div 
                            className="p-4 rounded-xl text-white shadow-lg animate-glow"
                            style={{ 
                              background: `linear-gradient(135deg, ${product.color}, ${product.color}dd)` 
                            }}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {product.description}
                          </p>
                          
                          {/* Category Badge */}
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/50 text-slate-700 border border-white/30">
                              <Target className="w-3 h-3 mr-1" />
                              {product.category}
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-slate-500">
                              <Star className="w-3 h-3 fill-current text-yellow-400" />
                              <span>4.8</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        
                        {/* Create Ticket Hint */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
                            Click to create ticket
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Empty State */}
              {!loading && products.length === 0 && (
                <div className="text-center py-12 animate-fade-in-scale">
                  <div className="glass-light rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
                    <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-float" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Products Available</h3>
                    <p className="text-slate-600 mb-4">
                      Contact your administrator to get access to products and start creating tickets.
                    </p>
                    <button className="btn-ripple bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover-lift">
                      Request Access
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-light rounded-2xl border border-white/20 backdrop-blur-xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold gradient-text-purple">Recent Activity</h3>
                <button className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                  View All
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto scrollbar-premium">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="group flex items-start space-x-3 p-3 rounded-xl hover:bg-white/30 transition-all duration-300 animate-slide-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {/* Activity Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    activity.type === 'ticket_created' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'ticket_resolved' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {activity.title}
                      </p>
                      {activity.priority && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(activity.priority)}`}>
                          {activity.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-1 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">by {activity.user}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Activity Footer */}
            <div className="p-4 border-t border-white/10">
              <button className="w-full text-center text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium">
                View All Activity →
              </button>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="glass-light rounded-2xl border border-white/20 backdrop-blur-xl p-6">
            <h3 className="text-lg font-bold gradient-text mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/tickets/create')}
                className="w-full btn-ripple bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all duration-300 hover-lift flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Ticket</span>
              </button>
              
              <button 
                onClick={() => navigate('/tickets')}
                className="w-full glass-light border border-white/30 text-slate-700 py-3 rounded-xl font-medium transition-all duration-300 hover-lift flex items-center justify-center space-x-2"
              >
                <Ticket className="w-5 h-5" />
                <span>View All Tickets</span>
              </button>
              
              {user?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="w-full glass-light border border-white/30 text-slate-700 py-3 rounded-xl font-medium transition-all duration-300 hover-lift flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Admin Panel</span>
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