

'use client';

import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { getSetting } from '@/services/settingsService';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContactPageContent } from '@/lib/types';
import { PageHeader } from '@/components/PageHeader';


function InfoCard({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-4 p-6 bg-card/50 rounded-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
            <div className="p-3 rounded-full bg-primary/10 text-primary mt-1 animate-spin-slow">
                {icon}
            </div>
            <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <div className="text-muted-foreground whitespace-pre-wrap">{children}</div>
            </div>
        </div>
    );
}

export default function ContactPage() {
  const [content, setContent] = useState<ContactPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSetting('contactPageContent').then(data => {
      if (data) {
        setContent(data);
      } else {
        // Fallback to default content
        setContent({
            mainTitle: 'Get In Touch',
            subtitle: "We'd love to hear from you! Reach out with any questions, feedback, or inquiries.",
            infoTitle: 'Contact Information',
            infoSubtitle: 'Find us through any of the channels below. Our team is ready to assist you.',
            email: 'support@example.com',
            phone: '+1 (555) 123-4567',
            address: '123 Gaming Lane\nDigital City, 98765',
        });
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
        <PageWrapper>
            <div className="space-y-12">
                <Skeleton className="h-32 w-full" />
                <div className="grid md:grid-cols-2 gap-12">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </PageWrapper>
    )
  }

  if (!content) {
    return <PageWrapper><p>Page content could not be loaded.</p></PageWrapper>;
  }

  return (
    <div className="space-y-12 pb-12">
      <PageHeader pageKey="contact" />

      <PageWrapper>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold font-headline">{content.infoTitle}</h2>
                <p className="text-muted-foreground">
                    {content.infoSubtitle}
                </p>
            </div>
            <div className="space-y-4">
                <InfoCard icon={<Mail className="h-6 w-6" />} title="Email Us">
                    <p>{content.email}</p>
                </InfoCard>
                 <InfoCard icon={<Phone className="h-6 w-6" />} title="Call Us">
                    <p>{content.phone}</p>
                </InfoCard>
                 <InfoCard icon={<MapPin className="h-6 w-6" />} title="Our Office">
                    <p>{content.address}</p>
                </InfoCard>
            </div>
          </div>
          <div>
             <Card className="shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Send a Message</CardTitle>
                <CardDescription>Our team will get back to you as soon as possible.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Name</label>
                            <Input id="name" placeholder="Your Name" />
                        </div>
                        <div className="space-y-2">
                             <label htmlFor="email" className="text-sm font-medium">Email</label>
                            <Input id="email" type="email" placeholder="Your Email" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                        <Input id="subject" placeholder="Message Subject" />
                    </div>
                    <div className="space-y-2">
                         <label htmlFor="message" className="text-sm font-medium">Message</label>
                        <Textarea id="message" placeholder="Your message..." rows={5} />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                    </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
