import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PromptList from './components/PromptList';
import PromptForm from './components/PromptForm';
import CategoryList from './components/CategoryList';
import Login from './components/Login';
import Register from './components/Register';
import CategoryForm from './components/CategoryForm';
import Profile from './components/Profile';
import Analytics from './components/Analytics';
import Search from './components/Search';
import Favorites from './components/Favorites';
import AuditLogs from './components/AuditLogs';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider, useTheme } from './hooks/useTheme';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed by default

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen page-bg">
      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
        darkMode={darkMode}
        onDarkModeToggle={toggleDarkMode}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex">
        {/* Sidebar */}
        <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar - Always full width on mobile */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-neutral-600 bg-opacity-75 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
              <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                collapsed={false} // Always show full sidebar on mobile
              />
            </div>
          </>
        )}

        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prompts" element={<PromptList />} />
              <Route path="/prompts/new" element={<PromptForm />} />
              <Route path="/prompts/:id/edit" element={<PromptForm />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/categories/new" element={<CategoryForm />} />
              <Route path="/categories/:id/edit" element={<CategoryForm />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/search" element={<Search />} />
            </Routes>
          </div>
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
