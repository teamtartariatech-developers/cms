
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Smartphone, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const TwoFactorAuth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [setupStep, setSetupStep] = useState<'disabled' | 'setup' | 'verify'>('disabled');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      checkTwoFactorStatus();
    }
  }, [user]);

  const checkTwoFactorStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('two_factor_auth')
        .select('enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setIsEnabled(data?.enabled || false);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const generateSecret = () => {
    // Generate a random base32 secret for TOTP
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  };

  const handleEnable2FA = async () => {
    setIsLoading(true);
    const newSecret = generateSecret();
    const codes = generateBackupCodes();
    
    setSecret(newSecret);
    setBackupCodes(codes);
    setSetupStep('setup');
    setIsLoading(false);
  };

  const handleVerify2FA = async () => {
    if (!user || !secret || !verificationCode) return;

    setIsLoading(true);

    try {
      // In a real implementation, you would verify the TOTP code here
      // For this demo, we'll accept any 6-digit code
      if (verificationCode.length !== 6) {
        throw new Error('Invalid verification code');
      }

      const { error } = await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: user.id,
          secret,
          backup_codes: backupCodes,
          enabled: true
        });

      if (error) throw error;

      setIsEnabled(true);
      setSetupStep('disabled');
      toast({
        title: "Success",
        description: "Two-factor authentication enabled successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enable 2FA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('two_factor_auth')
        .update({ enabled: false })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsEnabled(false);
      toast({
        title: "Success",
        description: "Two-factor authentication disabled.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (setupStep === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Smartphone className="h-5 w-5 mr-2" />
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription>Scan the QR code with your authenticator app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Scan this with Google Authenticator, Authy, or similar app:
            </p>
            <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300">
              <p className="text-xs font-mono break-all">{secret}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Manual entry: {secret}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="verification_code">Enter verification code from your app</Label>
            <Input
              id="verification_code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleVerify2FA} disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
            <Button variant="outline" onClick={() => setSetupStep('disabled')}>
              Cancel
            </Button>
          </div>

          {backupCodes.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="font-medium text-sm mb-2">Save these backup codes:</p>
              <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                {backupCodes.map((code, index) => (
                  <div key={index}>{code}</div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Store these codes safely. You can use them to access your account if you lose your device.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Shield className="h-5 w-5 mr-2" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {isEnabled ? 'Enabled' : 'Disabled'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isEnabled 
                ? 'Your account is protected with 2FA' 
                : 'Use an authenticator app for additional security'
              }
            </p>
          </div>
          <Button 
            onClick={isEnabled ? handleDisable2FA : handleEnable2FA}
            variant={isEnabled ? 'destructive' : 'default'}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isEnabled ? 'Disable' : 'Enable')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
