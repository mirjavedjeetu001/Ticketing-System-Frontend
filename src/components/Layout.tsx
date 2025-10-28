import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Ticket,
  Users,
  User,
  LogOut,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  Settings,
  ChevronDown,
  ChevronUp,
  Boxes,
  Tags,
  Star
} from 'lucide-react';
import logo from '../assets/logo-pulse.png';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const [adminMenuExpanded, setAdminMenuExpanded] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    ...(user?.role === 'admin' ? [
      { name: 'Users', href: '/users', icon: Users },
    ] : []),
  ];

  const adminNavigation = user?.role === 'admin' ? [
    { name: 'Products', href: '/admin/products', icon: Boxes, description: 'Manage products and their configurations' },
    { name: 'Features', href: '/admin/features', icon: Star, description: 'Manage product features for issue categorization' },
    { name: 'Categories', href: '/admin/categories', icon: Tags, description: 'Configure issue categories and SLA settings' },
    { name: 'Departments', href: '/admin/departments', icon: Users, description: 'Manage departments and user roles' },
    { name: 'System Settings', href: '/admin/system-settings', icon: Settings, description: 'Configure severities, priorities, and SLA rules' },
  ] : [];

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Jira-style Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out lg:static lg:inset-0`}>
        {/* Jira-style Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {sidebarCollapsed ? (
              <img src={logo} alt="Sheba Pulse" className="h-8 w-8 object-contain" />
            ) : (
              <>
                <img src={logo} alt="Sheba Pulse" className="h-8 w-8 object-contain" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">Sheba Pulse</h1>
                  <p className="text-xs text-gray-500">Ticketing System</p>
                </div>
              </>
            )}
          </div>
          
          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Jira-style Navigation */}
        <nav className="mt-4 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.href}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="ml-3 text-sm font-medium">{item.name}</span>
                    )}
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full top-1/2 ml-2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Admin Section */}
            {user?.role === 'admin' && (
              <div className="mt-6">
                <div className="relative group">
                  <button
                    onClick={() => setAdminMenuExpanded(!adminMenuExpanded)}
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'px-3'} py-2 rounded-md transition-colors duration-200 ${
                      location.pathname.startsWith('/admin')
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="ml-3 text-sm font-medium flex-1 text-left">System Administration</span>
                        {adminMenuExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full top-1/2 ml-2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      System Administration
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </div>

                {/* Admin Submenu */}
                {adminMenuExpanded && !sidebarCollapsed && (
                  <div className="mt-1 ml-4 space-y-1">
                    {adminNavigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="ml-2 text-sm">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Expanded admin menu for collapsed sidebar */}
                {sidebarCollapsed && (
                  <div className="absolute left-full top-0 ml-2 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto whitespace-nowrap z-50 min-w-64">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">SYSTEM ADMINISTRATION</div>
                      {adminNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-2 py-2 rounded text-sm transition-colors duration-200 ${
                              isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0 mr-2" />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Status Footer */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" title="System operational"></div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System Online</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Jira-style Top Bar */}
        <header className="bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tickets, users..."
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="text-xs">⌘K</span>
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.fullName}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
                
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Link
                    to="/profile"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Profile"
                  >
                    <User className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;