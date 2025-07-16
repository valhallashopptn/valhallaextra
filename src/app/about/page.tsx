
'use client';

import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Users, Target, Gem, Lightbulb, ShieldCheck, Heart } from 'lucide-react';

function ValueCard({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <div className="text-center p-6 bg-card/50 rounded-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10">
            <div className="inline-block p-4 bg-primary/10 text-primary rounded-full mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold font-headline mb-2">{title}</h3>
            <p className="text-muted-foreground">{children}</p>
        </div>
    );
}

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-12">
      <div className="relative h-[300px] md:h-[400px] flex items-center justify-center text-center bg-card">
         <Image 
            src="https://placehold.co/1920x400.png"
            alt="Team working together"
            fill
            className="object-cover opacity-20"
            data-ai-hint="office collaboration"
          />
        <div className="relative z-10 p-4">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
              About TopUp Hub
            </h1>
            <p className="mt-3 max-w-3xl mx-auto text-lg text-white/80 sm:text-xl">
              We're a passionate team dedicated to making digital content accessible for everyone, instantly and securely.
            </p>
        </div>
      </div>
      
      <PageWrapper>
        <div className="max-w-5xl mx-auto space-y-20">
            
            <section className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold font-headline">Our Story</h2>
                    <p className="text-muted-foreground">
                        Founded in 2023 by a group of avid gamers and tech enthusiasts, TopUp Hub was born from a simple observation: getting digital credits should be fast, easy, and completely secure. We were tired of slow delivery times and risky websites. So, we decided to build the platform we always wanted—one that puts the customer first and delivers on its promises every single time.
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
                    <ValueCard icon={<Lightbulb className="h-8 w-8" />} title="Innovation">
                        We constantly seek better ways to serve our customers, embracing new technologies and creative solutions.
                    </ValueCard>
                    <ValueCard icon={<ShieldCheck className="h-8 w-8" />} title="Integrity">
                        We operate with transparency and honesty. Your trust is our most valuable asset, and we work hard to protect it.
                    </ValueCard>
                     <ValueCard icon={<Heart className="h-8 w-8" />} title="Customer-First">
                        Our customers are at the heart of everything we do. We are committed to providing exceptional service and support.
                    </ValueCard>
                </div>
            </section>
            
            <div className="animated-separator"></div>
            
             <section className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-headline">Meet the Team</h2>
                    <p className="mt-2 text-muted-foreground">The passionate individuals powering TopUp Hub.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card className="text-center overflow-hidden">
                        <div className="relative h-56 bg-muted">
                             <Image src="https://placehold.co/400x400.png" alt="Team member" fill className="object-cover" data-ai-hint="professional portrait" />
                        </div>
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold">Alex Johnson</h3>
                            <p className="text-primary mt-1">CEO & Founder</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center overflow-hidden">
                        <div className="relative h-56 bg-muted">
                             <Image src="https://placehold.co/400x400.png" alt="Team member" fill className="object-cover" data-ai-hint="professional woman portrait" />
                        </div>
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold">Maria Garcia</h3>
                            <p className="text-primary mt-1">Head of Operations</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center overflow-hidden">
                        <div className="relative h-56 bg-muted">
                            <Image src="https://placehold.co/400x400.png" alt="Team member" fill className="object-cover" data-ai-hint="professional man portrait" />
                        </div>
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold">David Chen</h3>
                            <p className="text-primary mt-1">Lead Developer</p>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
      </PageWrapper>
    </div>
  );
}
