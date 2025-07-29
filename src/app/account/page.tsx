
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getOrdersForUser } from '@/services/orderService';
import { getUserProfile, getUserRank, updateUserProfile } from '@/services/walletService';
import type { Order, DeliveredAssetInfo, UserProfile } from '@/lib/types';
import { getAvatarList } from '@/services/avatarService';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PageWrapper } from '@/components/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Wallet, KeySquare, Copy, Check, Star, User, Camera } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RankProgressCard } from './RankProgressCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

function DeliveredAssetDialog({ asset, isOpen, onOpenChange }: { asset: DeliveredAssetInfo | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const [isCopied, setIsCopied] = useState(false);
    
    if (!asset) return null;

    const handleCopy = () => {
        let textToCopy = asset.data;
        if(asset.extraInfo) {
            textToCopy += `\n\nAdditional Information:\n${asset.extraInfo}`;
        }
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><KeySquare className="h-5 w-5" /> Your Delivered Item</DialogTitle>
                    <DialogDescription>
                        This is the digital item you purchased. Keep it safe.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div>
                        <Label className="text-xs font-semibold">Details</Label>
                        <div className="relative font-mono bg-muted p-3 rounded-md break-all whitespace-pre-wrap text-sm">
                            {asset.data}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 h-7 w-7"
                                onClick={handleCopy}
                            >
                                {isCopied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                                <span className="sr-only">Copy</span>
                            </Button>
                        </div>
                    </div>
                    {asset.extraInfo && (
                         <div>
                            <Label className="text-xs font-semibold">Additional Information</Label>
                            <p className="whitespace-pre-wrap p-2 text-sm">{asset.extraInfo}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

function AvatarSelectionDialog({ isOpen, onOpenChange, onAvatarSelect, currentAvatarUrl }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onAvatarSelect: (url: string) => void, currentAvatarUrl?: string }) {
    const [avatarList, setAvatarList] = useState<string[]>([]);
    
    useEffect(() => {
        if (isOpen) {
            getAvatarList().then(urls => setAvatarList(urls));
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Choose Your Avatar</DialogTitle>
                    <DialogDescription>Select an avatar from the list below.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] -mr-6 pr-6">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 py-4">
                        {avatarList.map(url => (
                            <button 
                                key={url} 
                                className={cn(
                                    "relative aspect-square rounded-full overflow-hidden border-2 transition-all duration-200",
                                    currentAvatarUrl === url ? 'border-primary ring-2 ring-primary' : 'border-transparent hover:border-primary'
                                )}
                                onClick={() => onAvatarSelect(url)}
                            >
                                <Image src={url} alt="Avatar option" fill className="object-cover" />
                                {currentAvatarUrl === url && (
                                    <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
                                        <Check className="h-8 w-8 text-primary-foreground" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

function OrderItemCard({ order, formatOrderPrice, formatItemPrice, getStatusBadgeClass, onViewAsset }: { order: Order, formatOrderPrice: any, formatItemPrice: any, getStatusBadgeClass: any, onViewAsset: (asset: DeliveredAssetInfo) => void }) {

    return (
        <AccordionItem value={order.id} key={order.id}>
            <AccordionTrigger>
                <div className="flex justify-between items-center w-full pr-4">
                <span>Order #{order.id.substring(0, 8)}</span>
                <span className="text-muted-foreground">{new Date(order.createdAt.toDate()).toLocaleDateString()}</span>
                <Badge variant={'default'} className={cn('capitalize', getStatusBadgeClass(order.status))}>
                    {order.status}
                </Badge>
                <span className="font-bold text-primary">{formatOrderPrice(order.total, order.currency)}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="space-y-4 pt-2">
                {order.items.map((item, index) => (
                    <div key={item.id + index} className="flex items-center space-x-4">
                        <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.dataAiHint} />
                        <div className="flex-grow flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                {item.customFieldData && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    {Object.entries(item.customFieldData).map(([key, value]) => (
                                    <div key={key}>
                                        <span className="font-medium">{key}:</span> {value}
                                    </div>
                                    ))}
                                </div>
                                )}
                            </div>
                        </div>
                        <p className="font-semibold min-w-[80px] text-right">{formatItemPrice(item.price, item.quantity, order.currency)}</p>
                    </div>
                ))}
                
                <Separator />
                <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatOrderPrice(order.subtotal, order.currency)}</span>
                    </div>
                     {order.couponDiscount && order.couponDiscount > 0 && (
                        <div className="flex justify-between text-primary">
                            <span>Coupon ({order.couponCode}):</span>
                            <span>-{formatOrderPrice(order.couponDiscount, order.currency)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatOrderPrice(order.tax, order.currency)}</span>
                    </div>
                     {order.tip && order.tip > 0 && (
                        <div className="flex justify-between">
                            <span>Tip:</span>
                            <span>{formatOrderPrice(order.tip, order.currency)}</span>
                        </div>
                    )}
                    {order.walletDeduction > 0 && (
                            <div className="flex justify-between text-primary">
                            <span>Wallet Credit:</span>
                            <span>-{formatOrderPrice(order.walletDeduction, order.currency)}</span>
                        </div>
                    )}
                     {order.coinsRedeemed && order.coinsRedeemed > 0 && (
                        <div className="flex justify-between text-primary">
                            <span>Valhalla Coins:</span>
                            <span>-{formatOrderPrice(order.coinDiscount ?? 0, order.currency)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-foreground">
                        <span>Total Paid:</span>
                        <span>{formatOrderPrice(order.total, order.currency)}</span>
                    </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold">Payment Method: {order.paymentMethod?.name || 'N/A'}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">{order.paymentMethod?.instructions}</p>
                    </div>
                    {order.deliveredAsset && order.status === 'completed' && (
                        <Button size="sm" onClick={() => onViewAsset(order.deliveredAsset!)}>
                            <KeySquare className="mr-2 h-4 w-4" /> View Item
                        </Button>
                    )}
                </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}

export default function AccountPage() {
  const { user, loading, logOut } = useAuth();
  const { toast } = useToast();
  const { formatPrice: formatCurrency, convertPrice, currency: currentDisplayCurrency } = useCurrency();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [viewingAsset, setViewingAsset] = useState<DeliveredAssetInfo | null>(null);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const fetchAccountData = async () => {
    if (user) {
      setOrdersLoading(true);
      const [userOrders, profile, rank] = await Promise.all([
          getOrdersForUser(user.uid),
          getUserProfile(user.uid),
          getUserRank(user.uid)
      ]);
      setOrders(userOrders);
      setUserProfile(profile);
      setGlobalRank(rank);
      setOrdersLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAccountData();
  }, [user]);
  
  const formatOrderPrice = (total: number, orderCurrency: 'TND' | 'USD') => {
    // Orders are stored in USD. We need to display them in the user's selected currency.
    let displayTotal = total;
    if (currentDisplayCurrency === 'TND') {
      displayTotal = convertPrice(total);
    }
    return formatCurrency(displayTotal, currentDisplayCurrency, true);
  }

  const formatItemPrice = (price: number, quantity: number, orderCurrency: 'TND' | 'USD') => {
    let displayPrice = price * quantity;
    if (currentDisplayCurrency === 'TND') {
        displayPrice = convertPrice(price) * quantity;
    }
    return formatCurrency(displayPrice, currentDisplayCurrency, true);
  }

  if (loading || !user || !userProfile) {
    return <div className="text-center container mx-auto px-4 py-8">Loading account details...</div>;
  }

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'paid':
        return 'bg-blue-600';
      case 'pending':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-600';
      case 'refunded':
        return 'bg-purple-600';
      default:
        return 'bg-gray-500';
    }
  }
  
  const handleViewAsset = (asset: DeliveredAssetInfo) => {
    setViewingAsset(asset);
  }
  
  const handleAvatarSelect = async (url: string) => {
    if (!user) return;
    try {
        await updateUserProfile(user.uid, { avatarUrl: url });
        setUserProfile(prev => prev ? { ...prev, avatarUrl: url } : null);
        toast({ title: 'Success!', description: 'Your avatar has been updated.' });
        setIsAvatarDialogOpen(false);
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to update your avatar.', variant: 'destructive' });
    }
  };

  return (
    <>
    <DeliveredAssetDialog 
        asset={viewingAsset}
        isOpen={!!viewingAsset}
        onOpenChange={(isOpen) => !isOpen && setViewingAsset(null)}
    />
    <AvatarSelectionDialog 
        isOpen={isAvatarDialogOpen} 
        onOpenChange={setIsAvatarDialogOpen}
        onAvatarSelect={handleAvatarSelect}
        currentAvatarUrl={userProfile.avatarUrl}
    />
    <PageWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Account</h1>
          <p className="text-muted-foreground">Welcome back, {userProfile.username}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Avatar className="h-20 w-20 border-2 border-primary">
                            <AvatarImage src={userProfile.avatarUrl} />
                            <AvatarFallback>{userProfile.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <button 
                            onClick={() => setIsAvatarDialogOpen(true)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        >
                            <Camera className="h-6 w-6" />
                        </button>
                    </div>
                    <div>
                        <p className="text-lg font-semibold">{userProfile.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                 </div>
                <Button variant="destructive" className='w-full' onClick={logOut}>Log Out</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                    {userProfile?.walletBalance !== undefined ? formatCurrency(userProfile.walletBalance) : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                    Your available credit for purchases.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valhalla Coins</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                    {userProfile?.valhallaCoins !== undefined ? userProfile.valhallaCoins.toLocaleString() : 'Loading...'}
                </div>
                <p className="text-xs text-muted-foreground">
                    Your loyalty points for discounts.
                </p>
              </CardContent>
            </Card>

          </div>

          <div className="md:col-span-2 space-y-8">
            {userProfile && <RankProgressCard xp={userProfile.xp} globalRank={globalRank ?? undefined} />}
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Review your past purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">Loading your orders...</div>
                ) : orders.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {orders.map(order => (
                      <OrderItemCard 
                        key={order.id}
                        order={order}
                        formatOrderPrice={formatOrderPrice}
                        formatItemPrice={formatItemPrice}
                        getStatusBadgeClass={getStatusBadgeClass}
                        onViewAsset={handleViewAsset}
                      />
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-muted-foreground text-center py-8">You have no past orders.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
    </>
  );
}
