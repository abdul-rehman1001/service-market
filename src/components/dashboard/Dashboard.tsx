'use client';

import { useState } from 'react';
import { DashboardCard } from './DashboardCard';
import { TaskItem } from './TaskItem';
import { ServiceCard } from './ServiceCard';
import { Sidebar } from './Sidebar';

interface Task {
  id: string;
  title: string;
  subtitle: string;
  priority?: 'High Priority' | 'Routine' | 'Optional';
  isCompleted: boolean;
}

export const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: "Complete Graphic Design for Client 'Nexus'",
      subtitle: 'Due today at 5:00 PM',
      priority: 'High Priority',
      isCompleted: false,
    },
    {
      id: '2',
      title: 'Review new appointment requests',
      subtitle: '8 pending reviews',
      priority: 'Routine',
      isCompleted: false,
    },
    {
      id: '3',
      title: 'Update portfolio with latest work',
      subtitle: 'Scheduled for tomorrow',
      priority: 'Optional',
      isCompleted: false,
    },
  ]);

  const handleTaskToggle = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              ☰
            </button>
            <div className="flex-1 mx-4 hidden sm:block">
              <input
                type="text"
                placeholder="Search appointments or services..."
                className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                🔔
              </button>
              <div className="w-10 h-10 rounded-full bg-orange-300 flex-shrink-0" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, Elena!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's your business snapshot for today.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard
                title="Total Clients"
                value={124}
                trend="5.2%"
                trendDirection="up"
              />
              <DashboardCard
                title="Upcoming Appointments"
                value={8}
                subtitle="+2 today"
              />
              <DashboardCard
                title="Unread Messages"
                value={3}
                subtitle="NEW"
              />
              <DashboardCard
                title="Profile Completion"
                value="95%"
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Tasks */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                      Recent Task List
                    </h2>
                   <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
  View All
</button>

                  </div>
                  <div className="p-6">
                    {tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        {...task}
                        onToggle={handleTaskToggle}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Services */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                      My Services
                    </h2>
                    <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg font-medium text-sm transition">
                      + Add New
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <ServiceCard
                      icon="🎨"
                      title="Graphic Design"
                      status="Active"
                    />
                    <ServiceCard
                      icon="💻"
                      title="Web Development"
                      status="Active"
                    />
                    <ServiceCard
                      icon="📱"
                      title="Marketing SEO"
                      status="Paused"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};