
import React, { useState } from 'react';
import { useMockAuth } from '@/hooks/useMockAuth';
import { Button } from '@/components/ui/button';
import LoginForm from '@/components/Auth/LoginForm';

const Index = () => {
  const { user, isLoading } = useMockAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return <LoginForm />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <img 
            src="/lovable-uploads/e02fb149-4759-4da3-920c-6d026f57cb35.png" 
            alt="Digital Diaries Logo" 
            className="h-24 w-auto mx-auto mb-8"
          />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Welcome to Digital Diaries</h1>
            <p className="text-xl text-muted-foreground">Employee Management System</p>
            <p className="text-muted-foreground">Please log in to access your dashboard.</p>
          </div>
          <Button 
            onClick={() => setShowLogin(true)}
            className="mt-6"
            size="lg"
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  // This will never be reached because App.tsx handles the redirect to dashboard for authenticated users
  return null;
};

export default Index;
