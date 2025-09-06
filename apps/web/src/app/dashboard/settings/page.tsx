'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User,
  Lock,
  Bell,
  Shield,
  Trash2,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building,
  Save,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/auth';
import { user as userApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PROVINCES } from '@/lib/constants';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.object({
    province: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const dealerSchema = z.object({
  dealershipName: z.string().min(2, 'Dealership name is required'),
  dealershipAddress: z.string().min(5, 'Address is required'),
  dealershipPhone: z.string().min(10, 'Phone number is required'),
  dealershipWebsite: z.string().url().optional().or(z.literal('')),
  dealershipDescription: z.string().optional(),
});

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailMessages: true,
    emailListingUpdates: true,
    emailNewsletter: false,
    pushMessages: true,
    pushListingUpdates: true,
    pushPriceDrops: true,
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: '',
      location: {
        province: '',
        city: '',
      },
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const dealerForm = useForm({
    resolver: zodResolver(dealerSchema),
    defaultValues: {
      dealershipName: user?.dealership?.name || '',
      dealershipAddress: '',
      dealershipPhone: '',
      dealershipWebsite: '',
      dealershipDescription: '',
    },
  });

  const handleProfileSubmit = async (data: any) => {
    try {
      setLoading(true);
      await userApi.updateProfile(data);
      
      // Update local user state
      updateUser({ ...user!, ...data });
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: any) => {
    try {
      setLoading(true);
      await userApi.changePassword(data.currentPassword, data.newPassword);
      
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      
      passwordForm.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to change password. Please check your current password.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      await userApi.updateProfile(formData);
      
      // Update avatar preview
      const avatarUrl = URL.createObjectURL(file);
      updateUser({ ...user!, avatar: avatarUrl });
      
      toast({
        title: 'Success',
        description: 'Avatar updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload avatar',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to the backend
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      // API call to delete account would go here
      toast({
        title: 'Account deletion initiated',
        description: 'Your account will be deleted within 24 hours.',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete account',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {user?.userType === 'dealer' && (
            <TabsTrigger value="dealer">Dealer</TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <Button variant="outline" disabled={uploadingAvatar} asChild>
                      <span>
                        <Camera className="h-4 w-4 mr-2" />
                        {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or WebP. Max 5MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Profile Form */}
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" className="pl-9" disabled />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Email cannot be changed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="tel" className="pl-9" placeholder="+1 (555) 123-4567" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            placeholder="Tell us about yourself..."
                          />
                        </FormControl>
                        <FormDescription>
                          Brief description for your profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="password" className="pl-9" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="password" className="pl-9" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Must be at least 8 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="password" className="pl-9" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading}>
                    <Shield className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="text-sm text-muted-foreground mt-2">
                Once you delete your account, there is no going back.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose what email notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-messages">New Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive new messages
                  </p>
                </div>
                <Switch
                  id="email-messages"
                  checked={notifications.emailMessages}
                  onCheckedChange={(checked) => handleNotificationChange('emailMessages', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-listings">Listing Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Updates about your listings and favorites
                  </p>
                </div>
                <Switch
                  id="email-listings"
                  checked={notifications.emailListingUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('emailListingUpdates', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-newsletter">Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Tips, trends, and updates from CarsCanada
                  </p>
                </div>
                <Switch
                  id="email-newsletter"
                  checked={notifications.emailNewsletter}
                  onCheckedChange={(checked) => handleNotificationChange('emailNewsletter', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Real-time notifications in your browser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-messages">New Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Instant notifications for new messages
                  </p>
                </div>
                <Switch
                  id="push-messages"
                  checked={notifications.pushMessages}
                  onCheckedChange={(checked) => handleNotificationChange('pushMessages', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-listings">Listing Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Views, inquiries, and updates on your listings
                  </p>
                </div>
                <Switch
                  id="push-listings"
                  checked={notifications.pushListingUpdates}
                  onCheckedChange={(checked) => handleNotificationChange('pushListingUpdates', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-price">Price Drops</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when favorited vehicles drop in price
                  </p>
                </div>
                <Switch
                  id="push-price"
                  checked={notifications.pushPriceDrops}
                  onCheckedChange={(checked) => handleNotificationChange('pushPriceDrops', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dealer Tab (only for dealer users) */}
        {user?.userType === 'dealer' && (
          <TabsContent value="dealer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dealership Information</CardTitle>
                <CardDescription>
                  Manage your dealership profile and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...dealerForm}>
                  <form onSubmit={dealerForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    <FormField
                      control={dealerForm.control}
                      name="dealershipName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dealership Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={dealerForm.control}
                      name="dealershipAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} className="pl-9" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={dealerForm.control}
                        name="dealershipPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={dealerForm.control}
                        name="dealershipWebsite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" placeholder="https://example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={dealerForm.control}
                      name="dealershipDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={4}
                              placeholder="Describe your dealership..."
                            />
                          </FormControl>
                          <FormDescription>
                            This will appear on your public dealer profile
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Dealership Info
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>
                  Your current plan and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">
                      {user.dealership?.subscriptionPlan || 'Basic'} Plan
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Renews monthly
                    </p>
                  </div>
                  <Button variant="outline">
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}