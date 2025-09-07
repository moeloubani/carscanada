'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Phone, MessageSquare, User, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';
import { messages } from '@/lib/api';
import { toast } from 'sonner';
import { Listing } from '@/hooks/useListings';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactSellerDialogProps {
  listing: Listing;
  children: React.ReactNode;
}

export function ContactSellerDialog({ listing, children }: ContactSellerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      message: `Hi, I'm interested in your ${listing.year} ${listing.make} ${listing.model}. Is it still available?`,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      
      if (user) {
        // Send message through the platform
        await messages.send({
          recipientId: listing.seller.id,
          listingId: listing.id,
          message: data.message,
        });
        toast.success('Message sent successfully!');
      } else {
        // For non-authenticated users, you might want to send an email
        // This would require a different API endpoint
        toast.info('Please log in to send messages directly through the platform');
      }
      
      setOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDealer = listing.seller.type === 'dealer';
  const sellerName = isDealer && listing.seller.dealership
    ? listing.seller.dealership.name
    : listing.seller.name;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact Seller</DialogTitle>
          <DialogDescription>
            Send a message about the {listing.year} {listing.make} {listing.model}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seller Info */}
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <Avatar>
              {isDealer && listing.seller.dealership?.logo ? (
                <AvatarImage src={listing.seller.dealership.logo} alt={sellerName} />
              ) : null}
              <AvatarFallback>
                {sellerName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{sellerName}</h3>
                <Badge variant={isDealer ? "default" : "secondary"}>
                  {isDealer ? "Dealer" : "Private Seller"}
                </Badge>
              </div>
              {listing.seller.phone && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  {listing.seller.phone}
                </div>
              )}
              {isDealer && listing.seller.dealership?.rating && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{listing.seller.dealership.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(123) 456-7890" 
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="john@example.com" 
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your message..."
                        className="min-h-[120px]"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific about what you'd like to know
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          </Form>

          {/* Quick Contact Options */}
          {listing.seller.phone && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Or contact directly:</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `tel:${listing.seller.phone}`}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Seller
                </Button>
                {user && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Open chat/messaging interface
                      window.location.href = `/messages?user=${listing.seller.id}`;
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}