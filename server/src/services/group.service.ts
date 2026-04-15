import { supabase } from '../config/supabase.js';

/**
 * Group service — uses groups, group_members, group_contributions tables.
 * Schema: groups(id, name, target_amount, emoji, created_by, created_at)
 *         group_members(id, group_id, user_id, contribution)
 *         group_contributions(id, group_id, user_id, amount, created_at)
 */

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

  // Get members + compute collected for each group
  const result = await Promise.all((groups || []).map(async (group) => {
    const { data: members } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group.id)
      .order('contribution', { ascending: false });

    const collected = (members || []).reduce((s, m) => s + Number(m.contribution || 0), 0);

    return { ...group, members: members || [], collected };
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
