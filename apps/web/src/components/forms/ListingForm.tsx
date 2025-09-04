'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Car,
  DollarSign,
  MapPin,
  Image,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ImageUploader } from './ImageUploader';
import {
  CAR_MAKES,
  CAR_MODELS,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  DRIVETRAIN_TYPES,
  COLORS,
  CONDITIONS,
  PROVINCES,
  MAJOR_CITIES,
  CAR_FEATURES,
  YEAR_RANGES,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

const listingSchema = z.object({
  // Step 1: Basic Info
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0, 'Price must be positive'),
  mileage: z.number().min(0, 'Mileage must be positive'),
  vin: z.string().optional(),
  
  // Step 2: Details
  bodyType: z.string().min(1, 'Body type is required'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  transmission: z.string().min(1, 'Transmission is required'),
  drivetrain: z.string().min(1, 'Drivetrain is required'),
  exteriorColor: z.string().min(1, 'Exterior color is required'),
  interiorColor: z.string().min(1, 'Interior color is required'),
  condition: z.string().min(1, 'Condition is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  features: z.array(z.string()).optional(),
  
  // Step 3: Location
  province: z.string().min(1, 'Province is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().regex(/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, 'Invalid postal code'),
  
  // Step 4: Images
  images: z.array(z.any()).min(1, 'At least one image is required'),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  initialData?: Partial<ListingFormData>;
  onSubmit: (data: ListingFormData, isDraft: boolean) => Promise<void>;
  loading?: boolean;
}

const steps = [
  { id: 1, name: 'Basic Info', icon: Car },
  { id: 2, name: 'Details', icon: Info },
  { id: 3, name: 'Location', icon: MapPin },
  { id: 4, name: 'Images', icon: Image },
  { id: 5, name: 'Review', icon: CheckCircle },
];

export function ListingForm({ initialData, onSubmit, loading }: ListingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMake, setSelectedMake] = useState(initialData?.make || '');
  const [selectedProvince, setSelectedProvince] = useState(initialData?.province || '');

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      vin: '',
      bodyType: '',
      fuelType: '',
      transmission: '',
      drivetrain: '',
      exteriorColor: '',
      interiorColor: '',
      condition: '',
      description: '',
      features: [],
      province: '',
      city: '',
      postalCode: '',
      images: [],
      ...initialData,
    },
  });

  const handleNext = async () => {
    // Validate current step fields
    let fieldsToValidate: (keyof ListingFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['make', 'model', 'year', 'price', 'mileage'];
        break;
      case 2:
        fieldsToValidate = ['bodyType', 'fuelType', 'transmission', 'drivetrain', 'exteriorColor', 'interiorColor', 'condition', 'description'];
        break;
      case 3:
        fieldsToValidate = ['province', 'city', 'postalCode'];
        break;
      case 4:
        fieldsToValidate = ['images'];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep(Math.min(currentStep + 1, steps.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    const isValid = await form.trigger();
    if (isValid || isDraft) {
      const data = form.getValues();
      await onSubmit(data, isDraft);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              disabled={step.id > currentStep}
              className={cn(
                "flex items-center gap-2 font-medium transition-colors",
                step.id === currentStep && "text-primary",
                step.id < currentStep && "text-primary cursor-pointer hover:underline",
                step.id > currentStep && "text-muted-foreground"
              )}
            >
              <step.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{step.name}</span>
            </button>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Form Steps */}
      <Form {...form}>
        <form className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedMake(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select make" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CAR_MAKES.map((make) => (
                            <SelectItem key={make} value={make}>
                              {make}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      {CAR_MODELS[selectedMake] ? (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CAR_MODELS[selectedMake].map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input {...field} placeholder="Enter model" />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {YEAR_RANGES.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (CAD)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="number"
                            className="pl-9"
                            placeholder="25000"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mileage (km)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="50000"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VIN (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter VIN number" />
                    </FormControl>
                    <FormDescription>
                      Vehicle Identification Number for verification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="bodyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select body type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BODY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FUEL_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmission</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TRANSMISSION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="drivetrain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Drivetrain</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select drivetrain" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DRIVETRAIN_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exteriorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exterior Color</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interiorColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interior Color</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONDITIONS.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Describe your vehicle's condition, history, and any special features..."
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters. Be detailed to attract buyers.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <div className="space-y-4">
                      {Object.entries(CAR_FEATURES).map(([category, features]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium mb-2">{category}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {features.map((feature) => (
                              <label
                                key={feature}
                                className="flex items-center space-x-2 text-sm"
                              >
                                <Checkbox
                                  checked={field.value?.includes(feature)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    field.onChange(
                                      checked
                                        ? [...current, feature]
                                        : current.filter((f) => f !== feature)
                                    );
                                  }}
                                />
                                <span>{feature}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedProvince(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROVINCES.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    {MAJOR_CITIES[selectedProvince as keyof typeof MAJOR_CITIES] ? (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MAJOR_CITIES[selectedProvince as keyof typeof MAJOR_CITIES].map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <FormControl>
                        <Input {...field} placeholder="Enter city" />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="A1A 1A1"
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Canadian postal code format: A1A 1A1
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 4: Images */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Images</FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value}
                        onChange={field.onChange}
                        maxImages={20}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload up to 20 images. First image will be the main photo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4">Review Your Listing</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Vehicle</h4>
                      <p className="text-lg font-semibold">
                        {form.watch('year')} {form.watch('make')} {form.watch('model')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                        <p className="font-semibold">
                          ${form.watch('price')?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Mileage</h4>
                        <p className="font-semibold">
                          {form.watch('mileage')?.toLocaleString()} km
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p className="font-semibold">
                        {form.watch('city')}, {form.watch('province')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                      <p className="text-sm line-clamp-3">
                        {form.watch('description')}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Images</h4>
                      <p className="font-semibold">
                        {form.watch('images')?.length || 0} images uploaded
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSubmit(true)}
                  disabled={loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              )}
              
              {currentStep < 5 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish Listing
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}