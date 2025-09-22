
import React, { Suspense } from 'react';
import { useMockAuth } from '@/hooks/useMockAuth';

// Lazy load components for better performance
const StatsCards = React.lazy(() => import('@/components/Dashboard/StatsCards'));
const AttendanceCard = React.lazy(() => import('@/components/Dashboard/AttendanceCard'));
const RecentActivity = React.lazy(() => import('@/components/Dashboard/RecentActivity'));

const LoadingCard = () => (
  <div className="animate-pulse">
    <div className="bg-muted rounded-lg h-32"></div>
  </div>
);

const Dashboard = () => {
  const { user } = useMockAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your workspace today.
        </p>
      </div>

      {/* Stats Overview */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)}</div>}>
        <StatsCards />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <div className="lg:col-span-1">
          <Suspense fallback={<LoadingCard />}>
            <AttendanceCard />
          </Suspense>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingCard />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
