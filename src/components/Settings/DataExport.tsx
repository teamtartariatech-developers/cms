
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { useMockAuth } from '@/hooks/useMockAuth';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const DataExport = () => {
  const { user, logout } = useMockAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDataExport = async () => {
    if (!user) return;

    setIsExporting(true);

    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));

      const exportData = {
        profile: user,
        attendance: [],
        timesheets: [],
        tasks: [],
        notifications: [],
        exported_at: new Date().toISOString()
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Account data exported successfully.");
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error("Failed to export account data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success("Your account has been permanently deleted.");

      // Logout user
      logout();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Download className="h-5 w-5 mr-2" />
            Export Account Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your account data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDataExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Download Account Data'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This will include your profile, attendance records, timesheets, tasks, and notifications.
          </p>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-destructive">
            <Trash2 className="h-5 w-5 mr-2" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Profile information</li>
                    <li>Attendance records</li>
                    <li>Timesheet data</li>
                    <li>Task assignments</li>
                    <li>Notifications</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p className="text-sm text-muted-foreground mt-2">
            This action is irreversible. Please export your data first if you need a backup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataExport;
