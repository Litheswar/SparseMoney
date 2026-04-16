import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

export async function getGroups(userId: string) {
  // Get groups where user is a member
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);

  // Also include groups created by user
  const { data: created } = await supabase
    .from('groups')
    .select('id')
    .eq('created_by', userId);

  const allIds = [...new Set([
    ...(memberships || []).map(m => m.group_id),
    ...(created || []).map(g => g.id),
  ])];

  if (allIds.length === 0) return [];

  const { data: groups, error } = await supabase
    .from('groups')
    .select('*')
    .in('id', allIds);

  if (error) throw error;

  // Get members + profiles + compute collected for each group
  const result = await Promise.all((groups || []).map(async (group) => {
    const { data: members, error: mErr } = await supabase
      .from('group_members')
      .select(`
        *,
        user:users (
          name,
          avatar,
          updated_at
        )
      `)
      .eq('group_id', group.id)
      .order('contribution', { ascending: false });

    if (mErr) logger.error('[GroupService] Member fetch error:', mErr);

    const mappedMembers = (members || []).map(m => ({
      userId: m.user_id,
      name: m.user?.name || 'Anonymous',
      totalContributed: Number(m.contribution || 0),
      lastActive: m.user?.updated_at || group.created_at,
      badges: Number(m.contribution) > (Number(group.target_amount) / 5) ? ['Whale 🐋'] : ['Saver 💰'],
    }));

    const collected = mappedMembers.reduce((s, m) => s + m.totalContributed, 0);

    // Latest contributions for live feed
    const { data: recentLogs } = await supabase
      .from('group_contributions')
      .select(`
        *,
        user:users (name)
      `)
      .eq('group_id', group.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const mappedLogs = (recentLogs || []).map(log => ({
      id: log.id,
      groupId: log.group_id,
      userName: log.user?.name || 'User',
      amount: Number(log.amount),
      source: 'manual', // or detect if it was a roundup
      timestamp: log.created_at
    }));

    return { 
      ...group, 
      members: mappedMembers,
      recentActivity: mappedLogs,
      collected, 
      goalAmount: Number(group.target_amount),
      totalSaved: collected,
      targetDate: new Date(new Date(group.created_at).getTime() + 30 * 86400000).toISOString(), 
      inviteCode: group.id.substring(0, 8).toUpperCase()
    };
  }));

  return result;
}

export async function createGroup(userId: string, name: string, goal: number, emoji: string) {
  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, target_amount: goal, emoji, created_by: userId })
    .select()
    .single();

  if (error) throw error;

  // Add creator as member
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: userId,
    contribution: 0,
  });

  return group;
}

export async function contribute(groupId: string, userId: string, amount: number) {
  // Update member contribution total
  const { data: member, error: mErr } = await supabase
    .from('group_members')
    .select('id, contribution')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (mErr) throw mErr;

  await supabase
    .from('group_members')
    .update({ contribution: Number(member.contribution) + amount })
    .eq('id', member.id);

  // Insert contribution log
  await supabase.from('group_contributions').insert({
    group_id: groupId,
    user_id: userId,
    amount,
  });
}
