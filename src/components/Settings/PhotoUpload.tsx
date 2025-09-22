
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

const PhotoUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Photo updated successfully!');
      
      // Refresh the page to show new photo
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={user?.avatar_url || undefined} />
        <AvatarFallback className="text-lg">
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <div>
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          onChange={uploadPhoto}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('photo-upload')?.click()}
          disabled={uploading}
        >
          <Camera className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Change Photo'}
        </Button>
        <p className="text-sm text-muted-foreground mt-1">JPG, PNG or GIF (max 2MB)</p>
      </div>
    </div>
  );
};

export default PhotoUpload;
