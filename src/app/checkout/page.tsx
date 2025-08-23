
'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addOrder } from '@/services/orderService';
import { getPaymentMethods } from '@/services/paymentMethodService';
import { getUserProfile } from '@/services/walletService';
import { getCouponByCode } from '@/services/couponService';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import type { PaymentMethod, CartItem, Coupon, UserProfile, CustomField as CustomFieldType, PaymentWarningSettings } from '@/lib/types';
import { Lock, Info, Wallet, Tag, CheckCircle, Star, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { OrderConfirmationDialog } from '@/components/OrderConfirmationDialog';
import { Slider } from '@/components/ui/slider';
import { getSetting } from '@/services/settingsService';


const COINS_TO_USD_RATE = 500; // 500 coins = $1

function CustomFieldInput({ item, field, value, onChange }: { item: CartItem; field: any; value: string; onChange: (itemId: string, fieldLabel: string, value: string) => void; }) {
  const [error, setError] = useState('');

  const validate = useCallback((val: string) => {
    if (!val) {
        setError('This field is required.');
        return false;
    }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setError('Please enter a valid email.');
        return false;
    }
    if (field.type === 'number' && !/^\d+$/.test(val)) {
        setError('Please enter a valid number.');
        return false;
    }
    setError('');
    return true;
  }, [field.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    validate(newValue);
    onChange(item.id, field.label, newValue);
  };
  
  // Initial validation
  useEffect(() => {
    validate(value);
  }, [value, validate]);

  return (
    <div className="space-y-2">
      <Label htmlFor={`${item.id}-${field.id}`}>{field.label}</Label>
      <Input
        id={`${item.id}-${field.id}`}
        type={field.type}
        value={value}
        onChange={handleChange}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function PaymentCustomFieldInput({ field, value, onChange }: { field: CustomFieldType; value: string; onChange: (fieldLabel: string, value: string) => void; }) {
  const [error, setError] = useState('');

  const validate = useCallback((val: string) => {
    if (!val) {
      setError('This field is required.');
      return false;
    }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setError('Please enter a valid email.');
      return false;
    }
    if (field.type === 'number' && !/^\d+$/.test(val)) {
      setError('Please enter a valid number.');
      return false;
    }
    setError('');
    return true;
  }, [field.type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    validate(newValue);
    onChange(field.label, newValue);
  };
  
  // Initial validation
  useEffect(() => {
    validate(value);
  }, [value, validate]);

  return (
    <div className="space-y-2">
      <Label htmlFor={`payment-${field.id}`}>{field.label}</Label>
      <Input
        id={`payment-${field.id}`}
        type={field.type}
        value={value}
        onChange={handleChange}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart, updateCartItemCustomData } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { currency: globalCurrency, formatPrice, setCurrency } = useCurrency();
  const router = useRouter();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [paymentWarning, setPaymentWarning] = useState<PaymentWarningSettings | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [tipPercentage, setTipPercentage] = useState(0);
  const [customTip, setCustomTip] = useState('');

  const [coinsToRedeem, setCoinsToRedeem] = useState(0);
  const [paymentCustomData, setPaymentCustomData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to proceed to checkout.',
        variant: 'destructive',
      });
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router, toast]);

  useEffect(() => {
    const fetchCheckoutData = async () => {
      if (user) {
        try {
          const [methods, profile, warning] = await Promise.all([
            getPaymentMethods(),
            getUserProfile(user.uid),
            getSetting('paymentWarning')
          ]);
          setPaymentMethods(methods);
          setUserProfile(profile);
          setPaymentWarning(warning || { message: 'Please submit accurate payment details. Submitting fake information will result in order cancellation and may lead to account suspension.', color: '#ef4444'});
          if (methods.length > 0) {
            setSelectedMethodId(methods[0].id)
          }
        } catch (error) {
          console.error("Failed to fetch checkout data:", error);
          toast({ title: 'Error', description: 'Could not load payment options.', variant: 'destructive' });
        }
      }
    };
    fetchCheckoutData();
  }, [user, toast]);

  const selectedMethod = useMemo(() => {
    return paymentMethods.find(method => method.id === selectedMethodId);
  }, [paymentMethods, selectedMethodId]);

  const effectiveCurrency = selectedMethod?.currency || globalCurrency;

  useEffect(() => {
    if (selectedMethod?.currency) {
      setCurrency(selectedMethod.currency);
    }
  }, [selectedMethod, setCurrency]);
  
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const rate = effectiveCurrency === 'TND' ? 3.1 : 1;
    let discount = 0;
    if (appliedCoupon.discountType === 'fixed') {
      discount = appliedCoupon.discountValue * rate;
    } else { // percentage
      discount = (cartTotal * rate) * (appliedCoupon.discountValue / 100);
    }
    return Math.min(discount, cartTotal * rate);
  }, [appliedCoupon, cartTotal, effectiveCurrency]);
  
  const subtotalAfterCoupon = useMemo(() => {
    const rate = effectiveCurrency === 'TND' ? 3.1 : 1;
    return (cartTotal * rate) - couponDiscountAmount;
  }, [cartTotal, couponDiscountAmount, effectiveCurrency]);

  const coinDiscountAmount = useMemo(() => {
    const discountInUSD = coinsToRedeem / COINS_TO_USD_RATE;
    const rate = effectiveCurrency === 'TND' ? 3.1 : 1;
    return discountInUSD * rate;
  }, [coinsToRedeem, effectiveCurrency]);

  const subtotalAfterCoins = useMemo(() => {
    return Math.max(0, subtotalAfterCoupon - coinDiscountAmount);
  }, [subtotalAfterCoupon, coinDiscountAmount]);

  const walletCredit = useMemo(() => {
    if (!useWallet || !userProfile) return 0;
    const rate = effectiveCurrency === 'TND' ? 3.1 : 1;
    const walletBalanceInCurrentCurrency = userProfile.walletBalance * rate;
    return Math.min(walletBalanceInCurrentCurrency, subtotalAfterCoins);
  }, [useWallet, userProfile, subtotalAfterCoins, effectiveCurrency]);

  const subtotalAfterWallet = useMemo(() => {
    return subtotalAfterCoins - walletCredit;
  }, [subtotalAfterCoins, walletCredit]);

  const tipAmount = useMemo(() => {
      if (customTip) {
          return parseFloat(customTip) || 0;
      }
      return subtotalAfterWallet * (tipPercentage / 100);
  }, [tipPercentage, customTip, subtotalAfterWallet]);

  const subtotalAfterTip = useMemo(() => {
    return subtotalAfterWallet + tipAmount;
  }, [subtotalAfterWallet, tipAmount]);

  const taxAmount = useMemo(() => {
    if (!selectedMethod) return 0;
    return subtotalAfterTip * (selectedMethod.taxRate / 100);
  }, [subtotalAfterTip, selectedMethod]);

  const finalTotal = useMemo(() => {
    return subtotalAfterTip + taxAmount;
  }, [subtotalAfterTip, taxAmount]);

  const walletDeductionInUSD = useMemo(() => {
    if (!useWallet || !userProfile) return 0;
    const couponDiscountUSD = couponDiscountAmount / (effectiveCurrency === 'TND' ? 3.1 : 1);
    const subtotalAfterCouponInUSD = cartTotal - couponDiscountUSD;
    const subtotalAfterCoinsInUSD = Math.max(0, subtotalAfterCouponInUSD - (coinsToRedeem / COINS_TO_USD_RATE));
    return Math.min(userProfile.walletBalance, subtotalAfterCoinsInUSD);
  }, [useWallet, userProfile, cartTotal, couponDiscountAmount, effectiveCurrency, coinsToRedeem]);

  const isFullPaymentByWallet = useMemo(() => {
      return walletCredit > 0 && finalTotal <= 0.001; // Use a small epsilon for floating point comparison
  }, [walletCredit, finalTotal]);

  useEffect(() => {
    if (isFullPaymentByWallet) {
        setSelectedMethodId(null);
    } else {
      if (!selectedMethodId && paymentMethods.length > 0) {
        setSelectedMethodId(paymentMethods[0].id)
      }
    }
  }, [isFullPaymentByWallet, paymentMethods, selectedMethodId]);
  
  useEffect(() => {
    // Reset payment custom data when selected method changes
    setPaymentCustomData({});
  }, [selectedMethodId]);

  const itemsWithCustomFields = useMemo(() => {
    return cartItems.filter(item => item.customFields && item.customFields.length > 0);
  }, [cartItems]);

  const areAllCustomFieldsValid = useMemo(() => {
    return itemsWithCustomFields.every(item => 
        item.customFields?.every(field => {
            const value = item.customFieldData?.[field.label];
            if (!value) return false;
             if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
            if (field.type === 'number' && !/^\d+$/.test(value)) return false;
            return true;
        })
    );
  }, [itemsWithCustomFields]);
  
  const arePaymentCustomFieldsValid = useMemo(() => {
    if (!selectedMethod || !selectedMethod.customFields || selectedMethod.customFields.length === 0) {
      return true;
    }
    return selectedMethod.customFields.every(field => {
      const value = paymentCustomData[field.label];
      if (!value) return false;
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
      if (field.type === 'number' && !/^\d+$/.test(value)) return false;
      return true;
    });
  }, [selectedMethod, paymentCustomData]);


  const handleCustomFieldChange = useCallback((itemId: string, fieldLabel: string, value: string) => {
    updateCartItemCustomData(itemId, fieldLabel, value);
  }, [updateCartItemCustomData]);

  const handlePaymentCustomFieldChange = useCallback((fieldLabel: string, value: string) => {
    setPaymentCustomData(prev => ({
        ...prev,
        [fieldLabel]: value
    }));
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    setAppliedCoupon(null);
    
    try {
        const coupon = await getCouponByCode(couponCode);
        if (!coupon) {
            setCouponError('Invalid coupon code.');
            return;
        }
        if (!coupon.isActive) {
            setCouponError('This coupon is not active.');
            return;
        }
        if (coupon.oneTimeUse && coupon.usedBy.includes(user!.uid)) {
            setCouponError('You have already used this coupon.');
            return;
        }
        setAppliedCoupon(coupon);
        toast({ title: "Coupon Applied!", description: `You've received a discount.` });
    } catch (err) {
        setCouponError('Failed to apply coupon.');
    } finally {
        setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!user) {
        router.push('/login?redirect=/checkout');
        return;
    }
    if (!isFullPaymentByWallet && !selectedMethodId) {
        toast({ title: 'Payment method required', description: 'Please select a payment method.', variant: 'destructive' });
        return;
    }
    if (!areAllCustomFieldsValid) {
        toast({ title: 'Information Required', description: 'Please fill out all required fields for your items.', variant: 'destructive' });
        return;
    }
     if (!arePaymentCustomFieldsValid) {
        toast({ title: 'Payment Information Required', description: 'Please fill out all required fields for your chosen payment method.', variant: 'destructive' });
        return;
    }
    
    setIsPlacingOrder(true);
    try {
      const paymentMethodDetails = isFullPaymentByWallet 
        ? { name: 'Wallet Balance', instructions: 'Paid in full with wallet balance.' }
        : { name: selectedMethod!.name, instructions: selectedMethod!.instructions ?? '' };

      // Convert displayed amounts back to USD for storage
      const conversionRate = effectiveCurrency === 'TND' ? 3.1 : 1;
      const finalTotalInUSD = finalTotal / conversionRate;
      const taxInUSD = taxAmount / conversionRate;
      const couponDiscountInUSD = couponDiscountAmount / conversionRate;
      const tipInUSD = tipAmount / conversionRate;
      const coinDiscountInUSD = coinDiscountAmount / conversionRate;

      await addOrder({
        userId: user.uid,
        userEmail: user.email || 'Anonymous',
        items: cartItems,
        subtotal: cartTotal,
        tax: taxInUSD,
        tip: tipInUSD,
        walletDeduction: walletDeductionInUSD,
        couponDiscount: couponDiscountInUSD,
        couponCode: appliedCoupon?.code,
        coinsRedeemed: coinsToRedeem,
        coinDiscount: coinDiscountInUSD,
        total: finalTotalInUSD,
        currency: effectiveCurrency,
        paymentMethod: paymentMethodDetails,
        paymentCustomData: paymentCustomData,
        status: isFullPaymentByWallet ? 'paid' : 'pending'
      });
      
      setIsConfirmationOpen(true);
      clearCart();

    } catch (error: any) {
       toast({
        title: 'Order Failed',
        description: error.message || 'There was a problem placing your order. Please try again.',
        variant: 'destructive',
      });
       console.error("Failed to place order:", error);
    } finally {
        setIsPlacingOrder(false);
    }
  };
  
  const isWalletAvailable = (userProfile?.walletBalance ?? 0) > 0;
  const areCoinsAvailable = (userProfile?.valhallaCoins ?? 0) > 0;


  if (authLoading || !user) {
    return <PageWrapper><div className="text-center">Loading...</div></PageWrapper>;
  }

  if (cartItems.length === 0 && !isConfirmationOpen) {
    return (
      <PageWrapper>
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-semibold">Your cart is empty.</h2>
            <p className="mt-2 text-muted-foreground">Add some products before you can checkout.</p>
            <Button asChild className="mt-6">
                <Link href="/products">Browse Products</Link>
            </Button>
        </div>
      </PageWrapper>
    );
  }

  const handleTipButtonClick = (p: number) => {
    setTipPercentage(p);
    setCustomTip('');
  }
  const handleCustomTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTip(e.target.value);
    setTipPercentage(0);
  }

  return (
    <PageWrapper>
      <OrderConfirmationDialog isOpen={isConfirmationOpen} onOpenChange={setIsConfirmationOpen} />
      <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-headline">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete your purchase by providing the necessary details.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
            {itemsWithCustomFields.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Required Information</CardTitle>
                        <CardDescription>Please provide the following details for your items.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {itemsWithCustomFields.map(item => (
                            <div key={item.id} className="p-4 border rounded-lg space-y-4">
                                <h3 className="font-semibold">{item.name}</h3>
                                {item.customFields?.map(field => (
                                    <CustomFieldInput 
                                        key={field.id}
                                        item={item}
                                        field={field}
                                        value={item.customFieldData?.[field.label] || ''}
                                        onChange={handleCustomFieldChange}
                                    />
                                ))}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select your preferred way to pay.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div
                    className={cn(
                        "flex items-center space-x-4 p-4 border rounded-md",
                        !isWalletAvailable && "bg-muted/50 text-muted-foreground"
                    )}
                >
                    <Checkbox id="useWallet"
                        checked={useWallet}
                        onCheckedChange={(checked) => setUseWallet(!!checked)}
                        disabled={!isWalletAvailable}
                    />
                    <Label htmlFor="useWallet" className={cn("flex-grow", !isWalletAvailable ? "cursor-not-allowed" : "cursor-pointer")}>
                        <div className="flex items-center">
                            <Wallet className="mr-2 h-5 w-5" />
                            <div className="flex-grow">
                                <p className="font-semibold">Use Wallet Credit</p>
                                <p className="text-sm">
                                    Balance: {userProfile !== null ? formatPrice(userProfile.walletBalance, undefined, false) : 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </Label>
                </div>

                <RadioGroup
                    value={isFullPaymentByWallet ? '' : selectedMethodId ?? ''}
                    onValueChange={setSelectedMethodId}
                    className={cn("space-y-4", isFullPaymentByWallet && "opacity-50 pointer-events-none")}
                    disabled={isFullPaymentByWallet}
                >
                    {paymentMethods.map(method => (
                    <Label key={method.id} htmlFor={method.id} className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-muted/50 has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary">
                        <RadioGroupItem value={method.id} id={method.id} />
                        {method.iconUrl && (
                        <Image src={method.iconUrl} alt={method.name} width={32} height={32} className="ml-4 mr-2 object-contain" />
                        )}
                        <span className="ml-4 font-semibold">{method.name}</span>
                    </Label>
                    ))}
                </RadioGroup>
              
              {paymentMethods.length === 0 && !isFullPaymentByWallet && (
                <p className="text-muted-foreground text-center py-4">No other payment methods available. Please contact support.</p>
              )}
              
              {selectedMethod && !isFullPaymentByWallet && (
                <Alert className="mt-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>{selectedMethod.name} Instructions</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap">
                    {selectedMethod.instructions}
                  </AlertDescription>
                </Alert>
              )}

              {selectedMethod && !isFullPaymentByWallet && selectedMethod.customFields && selectedMethod.customFields.length > 0 && (
                <div className="p-4 border rounded-lg space-y-4 mt-4">
                  <h3 className="font-semibold">{selectedMethod.name} Details</h3>
                  {selectedMethod.customFields.map(field => (
                    <PaymentCustomFieldInput
                      key={field.id}
                      field={field}
                      value={paymentCustomData[field.label] || ''}
                      onChange={handlePaymentCustomFieldChange}
                    />
                  ))}
                </div>
              )}

              {!isFullPaymentByWallet && paymentWarning && (
                <Alert 
                    variant="destructive" 
                    className="mt-4" 
                    style={{ 
                        borderColor: paymentWarning.color,
                        color: paymentWarning.color
                    }}
                >
                    <AlertTriangle className="h-4 w-4" style={{ color: paymentWarning.color }}/>
                    <AlertTitle style={{ color: paymentWarning.color }}>Important Notice</AlertTitle>
                    <AlertDescription style={{ color: paymentWarning.color }}>{paymentWarning.message}</AlertDescription>
                </Alert>
              )}

              {isFullPaymentByWallet && (
                 <Alert className="mt-6" variant="default">
                  <Wallet className="h-4 w-4" />
                  <AlertTitle>Paid in full with wallet</AlertTitle>
                  <AlertDescription>
                    Your wallet balance covers the entire order. No other payment method is needed.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            </CardContent>
          </Card>
        </div>
        <div>
           <Card className="bg-muted/50 sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-start space-x-4">
                     <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint={item.dataAiHint} />
                     <div className="flex-grow">
                      <p className="font-semibold">{item.name}</p>
                       <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        {item.customFieldData && (
                            <div className="text-xs text-muted-foreground mt-1">
                            {Object.entries(item.customFieldData).map(([key, value]) => (
                                <div key={key} className="truncate">
                                <span className="font-medium">{key}:</span> {value}
                                </div>
                            ))}
                            </div>
                        )}
                     </div>
                     <p className="font-semibold text-right flex-shrink-0">{formatPrice(item.price * item.quantity, effectiveCurrency)}</p>
                  </div>
                ))}
                <div className="animated-separator" />

                {areCoinsAvailable && (
                  <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <Label className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-accent" />
                        <span>Use Valhalla Coins</span>
                       </Label>
                       <span className="text-xs font-mono">{coinsToRedeem} / {userProfile?.valhallaCoins.toLocaleString()}</span>
                    </div>
                    <Slider 
                      min={0}
                      max={userProfile?.valhallaCoins ?? 0}
                      step={1}
                      value={[coinsToRedeem]}
                      onValueChange={(value) => setCoinsToRedeem(value[0])}
                    />
                     <div className="text-right text-sm text-muted-foreground">
                        <span>Discount: </span>
                        <span className="font-semibold text-primary">{formatPrice(coinDiscountAmount, effectiveCurrency, true)}</span>
                    </div>
                  </div>
                  <div className="animated-separator" />
                  </>
                )}

                <div className="space-y-4">
                    {!appliedCoupon ? (
                        <div className="flex items-end gap-2">
                            <div className="flex-grow">
                                <Label htmlFor="coupon">Coupon Code</Label>
                                <Input 
                                    id="coupon" 
                                    placeholder="Enter code" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={isApplyingCoupon}
                                />
                            </div>
                            <Button onClick={handleApplyCoupon} disabled={!couponCode || isApplyingCoupon}>
                                {isApplyingCoupon ? 'Applying...' : 'Apply'}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-950 border border-green-700">
                             <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div className="text-sm">
                                    <p className="font-semibold text-green-400">Coupon Applied</p>
                                    <p className="font-mono text-xs">{appliedCoupon.code}</p>
                                </div>
                             </div>
                             <Button variant="ghost" size="sm" onClick={removeCoupon}>Remove</Button>
                        </div>
                    )}
                    {couponError && <p className="text-sm text-destructive">{couponError}</p>}
                </div>
                 <div className="animated-separator" />
                 <div className="space-y-2">
                    <Label>Leave a Tip? (Optional)</Label>
                    <div className="grid grid-cols-4 gap-2">
                        {[10, 15, 20].map(p => (
                            <Button key={p} variant={tipPercentage === p ? 'default' : 'outline'} onClick={() => handleTipButtonClick(p)}>{p}%</Button>
                        ))}
                         <Input 
                            placeholder="Custom" 
                            type="number"
                            value={customTip}
                            onChange={handleCustomTipChange}
                            className={cn(customTip && "border-primary ring-1 ring-primary")}
                          />
                    </div>
                 </div>
                 <div className="animated-separator" />
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(cartTotal, effectiveCurrency)}</span>
                    </div>
                    {couponDiscountAmount > 0 && (
                       <div className="flex justify-between text-primary">
                            <span>Coupon Discount</span>
                            <span>-{formatPrice(couponDiscountAmount, effectiveCurrency, true)}</span>
                        </div>
                    )}
                     {coinDiscountAmount > 0 && (
                       <div className="flex justify-between text-primary">
                            <span>Valhalla Coins Discount</span>
                            <span>-{formatPrice(coinDiscountAmount, effectiveCurrency, true)}</span>
                        </div>
                    )}
                     {walletCredit > 0 && (
                       <div className="flex justify-between text-primary">
                            <span>Wallet Credit</span>
                            <span>-{formatPrice(walletCredit, effectiveCurrency, true)}</span>
                        </div>
                    )}
                     {tipAmount > 0 && (
                        <div className="flex justify-between">
                            <span>Tip</span>
                            <span>{formatPrice(tipAmount, effectiveCurrency, true)}</span>
                        </div>
                    )}
                    {selectedMethod && !isFullPaymentByWallet && (
                        <div className="flex justify-between">
                            <span>Tax ({selectedMethod.taxRate}%)</span>
                            <span>{formatPrice(taxAmount, effectiveCurrency, true)}</span>
                        </div>
                    )}
                </div>
                 <div className="animated-separator" />
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal, effectiveCurrency, true)}</span>
                </div>
              </div>
            </CardContent>
             <CardFooter className='flex-col items-stretch gap-4'>
                 <Button onClick={handleCheckout} className="w-full mt-2" size="lg" disabled={isPlacingOrder || (!selectedMethodId && !isFullPaymentByWallet) || !areAllCustomFieldsValid || !arePaymentCustomFieldsValid}>
                     <Lock className="mr-2 h-4 w-4" />
                    {isPlacingOrder ? 'Processing...' : `Place Order for ${formatPrice(finalTotal, effectiveCurrency, true)}`}
                  </Button>
            </CardFooter>
           </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
