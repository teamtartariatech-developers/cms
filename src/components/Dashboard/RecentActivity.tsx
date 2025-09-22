
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileText, Users, Calendar } from 'lucide-react';

const RecentActivity = React.memo(() => {
  const activities = [
    {
      icon: Clock,
      title: 'Checked in',
      description: 'Started work day',
      time: '9:00 AM',
      color: 'text-green-600',
    },
    {
      icon: FileText,
      title: 'Submitted timesheet',
      description: 'Week ending June 7th',
      time: '5:30 PM',
      color: 'text-blue-600',
    },
    {
      icon: Users,
      title: 'Team meeting',
      description: 'Weekly standup completed',
      time: '2:00 PM',
      color: 'text-purple-600',
    },
    {
      icon: Calendar,
      title: 'Project deadline',
      description: 'Mobile app MVP',
      time: 'Tomorrow',
      color: 'text-orange-600',
    },
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest updates and events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-4 animate-scale-in" 
               style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`p-2 rounded-full bg-muted ${activity.color} transition-all duration-200 hover:scale-110`}>
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-xs text-muted-foreground">{activity.description}</p>
            </div>
            <div className="text-xs text-muted-foreground">{activity.time}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

RecentActivity.displayName = 'RecentActivity';

export default RecentActivity;
