
'use client';

import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

function InfoCard({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-4 p-6 bg-card/50 rounded-lg transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
            <div className="p-3 rounded-full bg-primary/10 text-primary mt-1 animate-spin-slow">
                {icon}
            </div>
            <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <div className="text-muted-foreground">{children}</div>
            </div>
        </div>
    );
}

export default function ContactPage() {
  return (
    <div className="space-y-12 pb-12">
      <div className="bg-card py-12">
        <PageWrapper>
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl font-headline">
              Get In Touch
            </h1>
            <p className="mt-3 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
              We'd love to hear from you! Reach out with any questions, feedback, or inquiries.
            </p>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold font-headline">Contact Information</h2>
                <p className="text-muted-foreground">
                    Find us through any of the channels below. Our team is ready to assist you.
                </p>
            </div>
            <div className="space-y-4">
                <InfoCard icon={<Mail className="h-6 w-6" />} title="Email Us">
                    <p>support@example.com</p>
                </InfoCard>
                 <InfoCard icon={<Phone className="h-6 w-6" />} title="Call Us">
                    <p>+1 (555) 123-4567</p>
                </InfoCard>
                 <InfoCard icon={<MapPin className="h-6 w-6" />} title="Our Office">
                    <p>123 Gaming Lane<br/>Digital City, 98765</p>
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
