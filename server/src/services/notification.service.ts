import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function createNotification(userId: string, message: string, type: string = 'ROUNDUP') {
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, message, type, is_read: false })
    .select()
    .single();

  if (error) { logger.error('Notification insert failed:', error); return null; }
  return data;
}

export async function getNotifications(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function markAsRead(notificationId: string, userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function markAllRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}
