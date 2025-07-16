
'use client';

import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Users, Target, Gem, Lightbulb, ShieldCheck, Heart, Zap, Gamepad2, LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';

function ValueCard({ icon, title, children, animateIcon = false }: { icon: React.ReactNode, title: string, children: React.ReactNode, animateIcon?: boolean }) {
    return (
        <div className="text-center p-6 bg-card/50 rounded-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10">
            <div className={cn("inline-block p-4 bg-primary/10 text-primary rounded-full mb-4", animateIcon && "animate-spin-slow")}>
                {icon}
            </div>
            <h3 className="text-xl font-bold font-headline mb-2">{title}</h3>
            <p className="text-muted-foreground">{children}</p>
        </div>
    );
}

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-12">
      <div className="bg-card py-12">
        <PageWrapper>
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
              About ApexTop
            </h1>
            <p className="mt-3 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
              We're a passionate team dedicated to making digital content accessible for everyone, instantly and securely.
            </p>
          </div>
        </PageWrapper>
      </div>
      
      <PageWrapper>
        <div className="max-w-5xl mx-auto space-y-20">
            
            <section className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold font-headline">Our Story</h2>
                    <p className="text-muted-foreground">
                        Founded in 2023 by a group of avid gamers and tech enthusiasts, ApexTop was born from a simple observation: getting digital credits should be fast, easy, and completely secure. We were tired of slow delivery times and risky websites. So, we decided to build the platform we always wanted—one that puts the customer first and delivers on its promises every single time.
                    </p>
                     <p className="text-muted-foreground">
                        Today, we're proud to serve a growing community of users who trust us for their digital top-up needs. Our journey is just beginning, and we're constantly innovating to bring you the best experience possible.
                    </p>
                </div>
                <div>
                    <Image 
                        src="https://placehold.co/600x400.png"
                        alt="Founders discussion"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-lg"
                        data-ai-hint="startup meeting"
                    />
                </div>
            </section>
            
            <div className="animated-separator"></div>

            <section className="text-center">
                 <h2 className="text-3xl font-bold font-headline">Our Mission & Vision</h2>
                 <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                    Our mission is to provide the fastest, most secure, and most reliable platform for all digital top-up needs. Our vision is to build a global community where every digital transaction is seamless, trustworthy, and instant.
                 </p>
            </section>
            
            <div className="animated-separator"></div>

            <section className="space-y-8">
                 <div className="text-center">
                    <h2 className="text-3xl font-bold font-headline">Our Core Values</h2>
                    <p className="mt-2 text-muted-foreground">The principles that guide every decision we make.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <ValueCard icon={<Lightbulb className="h-8 w-8" />} title="Innovation" animateIcon>
                        We constantly seek better ways to serve our customers, embracing new technologies and creative solutions.
                    </ValueCard>
                    <ValueCard icon={<ShieldCheck className="h-8 w-8" />} title="Integrity" animateIcon>
                        We operate with transparency and honesty. Your trust is our most valuable asset, and we work hard to protect it.
                    </ValueCard>
                     <ValueCard icon={<Heart className="h-8 w-8" />} title="Customer-First" animateIcon>
                        Our customers are at the heart of everything we do. We are committed to providing exceptional service and support.
                    </ValueCard>
                </div>
            </section>
            
            <div className="animated-separator"></div>
            
            <section className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-headline">Why Choose Us?</h2>
                    <p className="mt-2 text-muted-foreground">The advantages of using ApexTop for your digital needs.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <ValueCard icon={<Zap className="h-8 w-8" />} title="Instant Delivery" animateIcon>
                        Your codes are delivered to your account immediately after purchase.
                    </ValueCard>
                    <ValueCard icon={<Gamepad2 className="h-8 w-8" />} title="Wide Selection" animateIcon>
                        A huge catalog of games, gift cards, and digital products.
                    </ValueCard>
                    <ValueCard icon={<ShieldCheck className="h-8 w-8" />} title="Secure Payments" animateIcon>
                        Shop with confidence using our secure and trusted payment gateways.
                    </ValueCard>
                    <ValueCard icon={<LifeBuoy className="h-8 w-8" />} title="24/7 Support" animateIcon>
                        Our dedicated support team is here to help you around the clock.
                    </ValueCard>
                </div>
            </section>
        </div>
      </PageWrapper>
    </div>
  );
}
