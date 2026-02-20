import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  nickname: string | null;
  avatar_url: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ nickname: null, avatar_url: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile({ nickname: null, avatar_url: null });
      setLoading(false);
      return;
    }

    supabase
      .from('profiles')
      .select('nickname, avatar_url')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile({ nickname: data.nickname, avatar_url: data.avatar_url });
        setLoading(false);
      });
  }, [user]);

  const updateNickname = useCallback(async (nickname: string) => {
    if (!user) return;
    await supabase.from('profiles').update({ nickname, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    setProfile(prev => ({ ...prev, nickname }));
  }, [user]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return;
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    await supabase.storage.from('avatars').upload(path, file, { upsert: true });

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatar_url = `${publicUrl}?t=${Date.now()}`;

    await supabase.from('profiles').update({ avatar_url, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    setProfile(prev => ({ ...prev, avatar_url }));
  }, [user]);

  return { profile, loading, updateNickname, uploadAvatar };
}
