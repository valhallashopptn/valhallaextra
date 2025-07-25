
'use client';

import { useEffect, useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { getTopUsers } from '@/services/walletService';
import { useToast } from '@/hooks/use-toast';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Trophy } from 'lucide-react';
import { RankIcon } from '@/app/account/RankProgressCard';
import { getRankDetails } from '@/app/account/RankProgressCard';
import { cn } from '@/lib/utils';

export default function LeaderboardPage() {
  const [topUsers, setTopUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const users = await getTopUsers(100); // Fetch top 100 users
        setTopUsers(users);
      } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        toast({ title: 'Error', description: 'Could not load the leaderboard.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [toast]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-amber-400';
    if (rank === 2) return 'text-slate-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
    return <Trophy className={cn("h-5 w-5", getRankColor(rank))} />;
  }

  return (
    <div className="space-y-12 pb-12">
      <div className="bg-card py-12">
        <PageWrapper>
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
              Ranking Leaderboard
            </h1>
            <p className="mt-3 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
              See who's at the top. Earn XP with every purchase to climb the ranks!
            </p>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper>
        <Card>
          <CardHeader>
            <CardTitle>Top 100 Players</CardTitle>
            <CardDescription>The most dedicated users on our platform.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Rank Icon</TableHead>
                  <TableHead className="text-right">Total XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  topUsers.map((user, index) => {
                    const rank = index + 1;
                    const { currentRank } = getRankDetails(user.xp);
                    return (
                      <TableRow key={user.id} className={cn(rank === 1 && "bg-amber-400/10", rank === 2 && "bg-slate-400/10", rank === 3 && "bg-amber-600/10")}>
                        <TableCell className="text-center">
                           <div className="flex items-center justify-center gap-2">
                                {getRankIcon(rank)}
                                <span className={cn("font-bold text-lg", getRankColor(rank))}>
                                    {rank}
                                </span>
                           </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </TableCell>
                         <TableCell className="text-center">
                          <div className="flex justify-center">
                            <RankIcon rank={currentRank} size="sm" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-primary">{user.xp.toLocaleString()} XP</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
             {!loading && topUsers.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    The leaderboard is currently empty. Be the first to make your mark!
                </div>
            )}
          </CardContent>
        </Card>
      </PageWrapper>
    </div>
  );
}
