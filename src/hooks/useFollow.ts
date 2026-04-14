import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFollow(targetUserId: string | undefined) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    if (!targetUserId) return;

    const [followersRes, followingRes] = await Promise.all([
      supabase.from("follows" as any).select("id", { count: "exact", head: true }).eq("following_id", targetUserId),
      supabase.from("follows" as any).select("id", { count: "exact", head: true }).eq("follower_id", targetUserId),
    ]);

    setFollowersCount((followersRes as any).count || 0);
    setFollowingCount((followingRes as any).count || 0);
  }, [targetUserId]);

  const checkIfFollowing = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    const { data } = await (supabase.from("follows" as any) as any)
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle();

    setIsFollowing(!!data);
  }, [user, targetUserId]);

  useEffect(() => {
    fetchCounts();
    checkIfFollowing();
  }, [fetchCounts, checkIfFollowing]);

  const toggleFollow = useCallback(async () => {
    if (!user || !targetUserId || user.id === targetUserId) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await (supabase.from("follows" as any) as any)
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", targetUserId);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
      } else {
        await (supabase.from("follows" as any) as any)
          .insert({ follower_id: user.id, following_id: targetUserId });
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
      }
    } catch (err) {
      console.error("Follow toggle error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, targetUserId, isFollowing]);

  return { isFollowing, followersCount, followingCount, loading, toggleFollow };
}
