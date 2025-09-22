
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

const Calendar = () => {
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Mock events for demonstration
  const events = [
    {
      id: 1,
      title: 'Team Meeting',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      location: 'Conference Room A',
      type: 'meeting'
    },
    {
      id: 2,
      title: 'Project Review',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 30),
      location: 'Virtual',
      type: 'review'
    },
    {
      id: 3,
      title: 'Client Presentation',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 12, 0),
      location: 'Client Office',
      type: 'presentation'
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'default';
      case 'review': return 'secondary';
      case 'presentation': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">Manage your meetings and events</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                {format(today, 'MMMM yyyy')}
              </CardTitle>
              <CardDescription>Week view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-2 text-center text-sm ${
                      format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                        ? 'bg-primary text-primary-foreground rounded'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <div className="font-medium">{format(day, 'EEE')}</div>
                    <div className="text-lg">{format(day, 'd')}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>
                            {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                          </span>
                          {event.location && (
                            <>
                              <MapPin className="h-3 w-3 ml-3 mr-1" />
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="p-2 border rounded">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(event.start, 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                View Month
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
