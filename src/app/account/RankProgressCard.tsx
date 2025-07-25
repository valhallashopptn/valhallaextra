
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Info, Trophy } from 'lucide-react';
import React from 'react';

const ranks = [
  { name: 'F-Rank', minXp: 0, color: 'text-gray-500', iconColor: 'border-gray-500' },
  { name: 'D-Rank', minXp: 1000, color: 'text-stone-400', iconColor: 'border-stone-400' },
  { name: 'C-Rank', minXp: 5000, color: 'text-orange-400', iconColor: 'border-orange-400' },
  { name: 'B-Rank', minXp: 15000, color: 'text-cyan-400', iconColor: 'border-cyan-400' },
  { name: 'A-Rank', minXp: 30000, color: 'text-blue-500', iconColor: 'border-blue-500' },
  { name: 'S-Rank', minXp: 50000, color: 'text-violet-500', iconColor: 'border-violet-500' },
  { name: 'SS-Rank', minXp: 100000, color: 'text-fuchsia-500', iconColor: 'border-fuchsia-500' },
  { name: 'SSS-Rank', minXp: 250000, color: 'text-red-500', iconColor: 'border-red-500' },
  { name: 'Apex-Rank', minXp: 500000, color: 'text-amber-400', iconColor: 'border-amber-400' },
];

const getRankDetails = (xp: number) => {
  let currentRank = ranks[0];
  let nextRank = ranks[1];

  for (let i = ranks.length - 1; i >= 0; i--) {
    if (xp >= ranks[i].minXp) {
      currentRank = ranks[i];
      nextRank = ranks[i + 1] || null;
      break;
    }
  }

  const xpInCurrentRank = xp - currentRank.minXp;
  const xpForNextRank = nextRank ? nextRank.minXp - currentRank.minXp : 0;
  const progressPercentage = nextRank ? (xpInCurrentRank / xpForNextRank) * 100 : 100;

  return { currentRank, nextRank, xp, xpInCurrentRank, xpForNextRank, progressPercentage };
};

const RankIcon = ({ rank }: { rank: typeof ranks[0]}) => (
    <div className={cn("h-10 w-10 flex items-center justify-center border-2 rounded-md transform -rotate-45", rank.iconColor)}>
        <span className={cn("font-black text-xl tracking-tighter transform rotate-45", rank.color)}>
            {rank.name.charAt(0)}
        </span>
    </div>
);

export function RankProgressCard({ xp, globalRank }: { xp: number; globalRank?: number }) {
  const { currentRank, nextRank, progressPercentage } = getRankDetails(xp);
  const xpToNext = nextRank ? nextRank.minXp - xp : 0;

  const CurrentRankIcon = () => (
    <div className={cn("h-14 w-14 flex items-center justify-center border-4 rounded-lg transform -rotate-45", currentRank.iconColor)}>
        <span className={cn("font-black text-2xl tracking-tighter transform rotate-45", currentRank.color)}>
            {currentRank.name.charAt(0)}
        </span>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Your Rank & Progress</CardTitle>
            <CardDescription>Track your journey. Higher ranks may unlock future benefits!</CardDescription>
          </div>
           <Dialog>
                <DialogTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>All Available Ranks</DialogTitle>
                        <DialogDescription>
                            Earn 10 XP for every $1 spent to climb the ranks.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rank</TableHead>
                                    <TableHead className="text-right">XP Required</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ranks.map(rank => (
                                    <TableRow key={rank.name}>
                                        <TableCell className="flex items-center gap-4 font-medium">
                                            <RankIcon rank={rank} />
                                            <span className={cn(rank.color)}>{rank.name}</span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{rank.minXp.toLocaleString()} XP</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="flex items-center justify-between bg-card/50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <CurrentRankIcon />
            <div>
              <h3 className={cn("text-2xl font-bold font-headline", currentRank.color)}>{currentRank.name}</h3>
              <p className="text-sm text-muted-foreground">Total XP: {xp.toLocaleString()}</p>
            </div>
          </div>
          {globalRank && (
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Global Rank</span>
              </div>
              <p className="text-2xl font-bold">#{globalRank}</p>
            </div>
          )}
        </div>

        {nextRank && (
            <div>
                <div className="flex justify-between items-end text-sm mb-2">
                    <span className="font-medium">Progress to {nextRank.name}</span>
                    <span className="text-muted-foreground">{xp.toLocaleString()} XP / {nextRank.minXp.toLocaleString()} XP</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-center text-sm text-muted-foreground mt-3">
                    Earn <span className="font-bold text-primary">{xpToNext.toLocaleString()} XP</span> more to rank up.
                </p>
            </div>
        )}

        {!nextRank && (
             <div className="text-center text-amber-400 font-semibold flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5" />
                You have reached the highest rank!
             </div>
        )}
      </CardContent>
    </Card>
  );
}
