
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Info, Trophy, Shield, Gem, Swords, ShieldQuestion, ShieldCheck, Crown, Skull } from 'lucide-react';
import React from 'react';

const ranks = [
  { name: 'F-Rank', minXp: 0, color: 'text-gray-400', iconColor: 'border-gray-400', icon: <ShieldQuestion /> },
  { name: 'E-Rank', minXp: 6000, color: 'text-green-400', iconColor: 'border-green-400', icon: <Shield /> },
  { name: 'D-Rank', minXp: 9600, color: 'text-cyan-400', iconColor: 'border-cyan-400', icon: <ShieldCheck /> },
  { name: 'C-Rank', minXp: 15360, color: 'text-blue-400', iconColor: 'border-blue-400', icon: <Swords /> },
  { name: 'B-Rank', minXp: 24576, color: 'text-purple-400', iconColor: 'border-purple-400', icon: <Swords /> },
  { name: 'A-Rank', minXp: 39321, color: 'text-pink-400', iconColor: 'border-pink-400', icon: <Gem /> },
  { name: 'S-Rank', minXp: 62914, color: 'text-red-400', iconColor: 'border-red-400', icon: <Gem /> },
  { name: 'SS-Rank', minXp: 100663, color: 'text-yellow-400', iconColor: 'border-yellow-400', icon: <Trophy /> },
  { name: 'Legend', minXp: 161061, color: 'text-violet-400', iconColor: 'border-violet-400', icon: <Crown /> },
  { name: 'LORD', minXp: 257698, color: 'text-orange-400', iconColor: 'border-orange-400', icon: <Skull /> },
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

const RankIcon = ({ rank, size = 'sm' }: { rank: typeof ranks[0], size?: 'sm' | 'lg' }) => {
    const iconSizeClass = size === 'sm' ? "h-6 w-6" : "h-10 w-10";
    const boxSizeClass = size === 'sm' ? "h-10 w-10" : "h-16 w-16";
    const borderClass = size === 'sm' ? "border-2" : "border-4";

    return (
        <div className={cn(boxSizeClass, "flex items-center justify-center rounded-md", rank.iconColor, borderClass, rank.color)}>
            {React.cloneElement(rank.icon, { className: iconSizeClass })}
        </div>
    );
}

export function RankProgressCard({ xp, globalRank }: { xp: number; globalRank?: number }) {
  const { currentRank, nextRank, progressPercentage } = getRankDetails(xp);
  const xpToNext = nextRank ? nextRank.minXp - xp : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Your Rank & Progress</CardTitle>
            <CardDescription>Track your journey. Higher ranks unlock greater prestige!</CardDescription>
          </div>
           <Dialog>
                <DialogTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>All Available Ranks</DialogTitle>
                        <DialogDescription>
                            Rank up by making purchases. Higher ranks unlock greater prestige as a hunter!
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
                                            <RankIcon rank={rank} size="sm" />
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
            <RankIcon rank={currentRank} size="lg" />
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
