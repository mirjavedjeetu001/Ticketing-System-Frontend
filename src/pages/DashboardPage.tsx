import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Ticket, Users, Clock, CheckCircle, Plus, Activity,
  TrendingUp, TrendingDown
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
      trend: 'up' as const,
      icon: Ticket, 
    },
    { 
      name: 'In Progress', 
      value: '8', 
      change: '-1.2%',
      trend: 'down' as const,
      icon: Clock, 
    },
    { 
      name: 'Resolved Today', 
      value: '24', 
      change: '+12.3%',
      trend: 'up' as const,
      icon: CheckCircle, 
    },
    { 
      name: 'Total Users', 
      value: '156', 
      change: '+5.7%',
      trend: 'up' as const,
      icon: Users, 
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'ticket_created',
      title: 'New ticket created',
      description: 'Server downtime issue reported',
      time: '5 min ago',
      user: 'John Doe',
    },
    {
      id: '2',
      type: 'ticket_resolved',
      title: 'Ticket resolved',
      description: 'Mobile app login issue fixed',
      time: '12 min ago',
      user: 'Sarah Johnson',
    },
    {
      id: '3',
      type: 'comment_added',
      title: 'Comment added',
      description: 'Technical team provided update',
      time: '25 min ago',
      user: 'Mike Wilson',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ticket_created': return <Plus className="w-4 h-4" />;
      case 'ticket_resolved': return <CheckCircle className="w-4 h-4" />;
      case 'comment_added': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {user?.firstName}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Here's what's happening with your tickets today
            </p>
          </div>
          <button 
            onClick={() => navigate('/tickets/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <div 
              key={stat.name} 
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className={`flex items-center text-xs font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Available Products */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Available Products</h2>
              <p className="text-sm text-gray-600 mt-1">Click on a product to create a ticket</p>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-3">📦</div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No Products Available</h3>
                  <p className="text-sm text-gray-600">
                    Contact your administrator to get access to products.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <button
                      key={product._id}
                      className="text-left p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all bg-white"
                      onClick={() => navigate('/tickets/new', { 
                        state: { productId: product._id, productName: product.name } 
                      })}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <div className="w-5 h-5 text-gray-600">
                            {product.icon === 'Globe' ? '🌐' : 
                             product.icon === 'Smartphone' ? '📱' : 
                             product.icon === 'Server' ? '🖥️' : 
                             product.icon === 'Headphones' ? '🎧' : 
                             product.icon === 'CreditCard' ? '💳' : '📦'}
                          </div>
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {product.description}
                      </p>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {product.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {recentActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg text-gray-600">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">by {activity.user}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={() => navigate('/tickets')}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Activity →
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/tickets/new')}
                className="w-full text-left px-4 py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium text-sm"
              >
                + Create New Ticket
              </button>
              <button 
                onClick={() => navigate('/tickets')}
                className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                📋 View All Tickets
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                >
                  ⚙️ Admin Panel
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
