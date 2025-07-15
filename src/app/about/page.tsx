
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Users, Target, Gem } from 'lucide-react';

function InfoCard({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    {icon}
                </div>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{children}</p>
            </CardContent>
        </Card>
    );
}

export default function AboutPage() {
  return (
    <div className="space-y-12">
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
              About Us
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-foreground/80 sm:text-xl">
              Learn more about our journey, our mission, and the team that makes it all happen.
            </p>
        </div>
      </div>
      
      <PageWrapper>
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
                <InfoCard icon={<Target className="h-8 w-8" />} title="Our Mission">
                    Our mission is to provide gamers and digital consumers with the fastest, most secure, and most reliable platform for all their top-up needs. We believe in instant delivery and exceptional customer service.
                </InfoCard>
                 <InfoCard icon={<Gem className="h-8 w-8" />} title="Our Values">
                    We are driven by a passion for gaming and technology. Our core values are customer-centricity, integrity, and continuous innovation. We strive to build a community where every transaction is seamless and trustworthy.
                </InfoCard>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle className="text-center text-3xl font-bold font-headline">Meet the Team</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
                        <div className="space-y-3">
                            <Image src="https://placehold.co/200x200.png" alt="Team member" width={150} height={150} className="rounded-full mx-auto" data-ai-hint="professional portrait" />
                            <h3 className="text-xl font-semibold">Alex Johnson</h3>
                            <p className="text-primary">CEO & Founder</p>
                        </div>
                         <div className="space-y-3">
                            <Image src="https://placehold.co/200x200.png" alt="Team member" width={150} height={150} className="rounded-full mx-auto" data-ai-hint="professional woman portrait" />
                            <h3 className="text-xl font-semibold">Maria Garcia</h3>
                            <p className="text-primary">Head of Operations</p>
                        </div>
                         <div className="space-y-3">
                            <Image src="https://placehold.co/200x200.png" alt="Team member" width={150} height={150} className="rounded-full mx-auto" data-ai-hint="professional man portrait" />
                            <h3 className="text-xl font-semibold">David Chen</h3>
                            <p className="text-primary">Lead Developer</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </PageWrapper>
    </div>
  );
}
