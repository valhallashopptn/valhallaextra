
'use client';

import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <PageWrapper>
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-headline text-primary">Contact Us</h1>
          <p className="mt-2 text-lg text-muted-foreground">We'd love to hear from you! Reach out with any questions or feedback.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold font-headline">Contact Information</h2>
              <div className="space-y-4">
                  <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary mt-1">
                          <Mail className="h-6 w-6" />
                      </div>
                      <div>
                          <h3 className="font-semibold">Email</h3>
                          <p className="text-muted-foreground">support@example.com</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary mt-1">
                          <Phone className="h-6 w-6" />
                      </div>
                      <div>
                          <h3 className="font-semibold">Phone</h3>
                          <p className="text-muted-foreground">+1 (555) 123-4567</p>
                      </div>
                  </div>
                   <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary mt-1">
                          <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                          <h3 className="font-semibold">Address</h3>
                          <p className="text-muted-foreground">123 Gaming Lane<br/>Digital City, 98765</p>
                      </div>
                  </div>
              </div>
          </div>
          <div className="md:col-span-3">
             <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
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
                    <Button type="submit" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
