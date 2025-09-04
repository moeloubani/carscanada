import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { 
  createListingSchema, 
  updateListingSchema, 
  listingFiltersSchema 
} from '@carscanada/validators';

// Canadian provinces
const CANADIAN_PROVINCES = [
  'ON', 'QC', 'BC', 'AB', 'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'NT', 'YT', 'NU'
];

// Car specific enums
const BODY_TYPES = [
  'Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Convertible', 
  'Van', 'Wagon', 'Minivan', 'Crossover', 'Sports Car', 'Luxury Car'
];

const TRANSMISSIONS = ['Manual', 'Automatic', 'CVT', 'Dual-Clutch', 'Semi-Automatic'];

const FUEL_TYPES = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid', 'Hydrogen'];

const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'];

const CONDITIONS = ['New', 'Used', 'Certified Pre-Owned', 'Salvage', 'Parts Only'];

// Validate create listing request
export const validateCreateListing = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Parse and validate request body
    const validatedData = createListingSchema.parse(req.body);
    
    // Additional Canadian-specific validations
    if (!CANADIAN_PROVINCES.includes(validatedData.province.toUpperCase())) {
      res.status(400).json({
        success: false,
        error: 'Invalid Canadian province',
        details: {
          field: 'province',
          message: 'Must be a valid Canadian province code',
          validValues: CANADIAN_PROVINCES
        }
      });
      return;
    }

    // Validate car-specific enums
    if (!BODY_TYPES.includes(validatedData.bodyType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid body type',
        details: {
          field: 'bodyType',
          message: 'Must be a valid body type',
          validValues: BODY_TYPES
        }
      });
      return;
    }

    if (!TRANSMISSIONS.includes(validatedData.transmission)) {
      res.status(400).json({
        success: false,
        error: 'Invalid transmission type',
        details: {
          field: 'transmission',
          message: 'Must be a valid transmission type',
          validValues: TRANSMISSIONS
        }
      });
      return;
    }

    if (!FUEL_TYPES.includes(validatedData.fuelType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid fuel type',
        details: {
          field: 'fuelType',
          message: 'Must be a valid fuel type',
          validValues: FUEL_TYPES
        }
      });
      return;
    }

    if (!DRIVETRAINS.includes(validatedData.drivetrain)) {
      res.status(400).json({
        success: false,
        error: 'Invalid drivetrain',
        details: {
          field: 'drivetrain',
          message: 'Must be a valid drivetrain',
          validValues: DRIVETRAINS
        }
      });
      return;
    }

    if (!CONDITIONS.includes(validatedData.condition)) {
      res.status(400).json({
        success: false,
        error: 'Invalid condition',
        details: {
          field: 'condition',
          message: 'Must be a valid condition',
          validValues: CONDITIONS
        }
      });
      return;
    }

    // VIN validation (if provided)
    if (validatedData.vin) {
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
      if (!vinRegex.test(validatedData.vin.toUpperCase())) {
        res.status(400).json({
          success: false,
          error: 'Invalid VIN',
          details: {
            field: 'vin',
            message: 'VIN must be exactly 17 characters (letters and numbers only, excluding I, O, and Q)'
          }
        });
        return;
      }
    }

    // Store validated data for controller use
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
      return;
    }
    next(error);
  }
};

// Validate update listing request
export const validateUpdateListing = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Parse and validate request body
    const validatedData = updateListingSchema.parse(req.body);
    
    // Additional validations for provided fields
    if (validatedData.province && !CANADIAN_PROVINCES.includes(validatedData.province.toUpperCase())) {
      res.status(400).json({
        success: false,
        error: 'Invalid Canadian province',
        details: {
          field: 'province',
          message: 'Must be a valid Canadian province code',
          validValues: CANADIAN_PROVINCES
        }
      });
      return;
    }

    if (validatedData.bodyType && !BODY_TYPES.includes(validatedData.bodyType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid body type',
        details: {
          field: 'bodyType',
          message: 'Must be a valid body type',
          validValues: BODY_TYPES
        }
      });
      return;
    }

    if (validatedData.transmission && !TRANSMISSIONS.includes(validatedData.transmission)) {
      res.status(400).json({
        success: false,
        error: 'Invalid transmission type',
        details: {
          field: 'transmission',
          message: 'Must be a valid transmission type',
          validValues: TRANSMISSIONS
        }
      });
      return;
    }

    if (validatedData.fuelType && !FUEL_TYPES.includes(validatedData.fuelType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid fuel type',
        details: {
          field: 'fuelType',
          message: 'Must be a valid fuel type',
          validValues: FUEL_TYPES
        }
      });
      return;
    }

    if (validatedData.drivetrain && !DRIVETRAINS.includes(validatedData.drivetrain)) {
      res.status(400).json({
        success: false,
        error: 'Invalid drivetrain',
        details: {
          field: 'drivetrain',
          message: 'Must be a valid drivetrain',
          validValues: DRIVETRAINS
        }
      });
      return;
    }

    if (validatedData.condition && !CONDITIONS.includes(validatedData.condition)) {
      res.status(400).json({
        success: false,
        error: 'Invalid condition',
        details: {
          field: 'condition',
          message: 'Must be a valid condition',
          validValues: CONDITIONS
        }
      });
      return;
    }

    // VIN validation (if provided)
    if (validatedData.vin) {
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
      if (!vinRegex.test(validatedData.vin.toUpperCase())) {
        res.status(400).json({
          success: false,
          error: 'Invalid VIN',
          details: {
            field: 'vin',
            message: 'VIN must be exactly 17 characters (letters and numbers only, excluding I, O, and Q)'
          }
        });
        return;
      }
    }

    // Store validated data for controller use
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
      return;
    }
    next(error);
  }
};

// Validate listing filters
export const validateListingFilters = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // Convert query parameters to appropriate types
    const filters: any = {
      ...req.query,
      yearMin: req.query.yearMin ? parseInt(req.query.yearMin as string) : undefined,
      yearMax: req.query.yearMax ? parseInt(req.query.yearMax as string) : undefined,
      priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
      priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
      mileageMax: req.query.mileageMax ? parseInt(req.query.mileageMax as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 20,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === '') {
        delete filters[key];
      }
    });

    // Validate with schema
    const validatedData = listingFiltersSchema.parse(filters);

    // Additional validations
    if (validatedData.yearMin && validatedData.yearMax && validatedData.yearMin > validatedData.yearMax) {
      res.status(400).json({
        success: false,
        error: 'Invalid year range',
        details: {
          message: 'Minimum year cannot be greater than maximum year'
        }
      });
      return;
    }

    if (validatedData.priceMin && validatedData.priceMax && validatedData.priceMin > validatedData.priceMax) {
      res.status(400).json({
        success: false,
        error: 'Invalid price range',
        details: {
          message: 'Minimum price cannot be greater than maximum price'
        }
      });
      return;
    }

    if (validatedData.province && !CANADIAN_PROVINCES.includes(validatedData.province.toUpperCase())) {
      res.status(400).json({
        success: false,
        error: 'Invalid Canadian province',
        details: {
          field: 'province',
          message: 'Must be a valid Canadian province code',
          validValues: CANADIAN_PROVINCES
        }
      });
      return;
    }

    if (validatedData.bodyType && !BODY_TYPES.includes(validatedData.bodyType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid body type filter',
        details: {
          field: 'bodyType',
          validValues: BODY_TYPES
        }
      });
      return;
    }

    if (validatedData.transmission && !TRANSMISSIONS.includes(validatedData.transmission)) {
      res.status(400).json({
        success: false,
        error: 'Invalid transmission filter',
        details: {
          field: 'transmission',
          validValues: TRANSMISSIONS
        }
      });
      return;
    }

    if (validatedData.fuelType && !FUEL_TYPES.includes(validatedData.fuelType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid fuel type filter',
        details: {
          field: 'fuelType',
          validValues: FUEL_TYPES
        }
      });
      return;
    }

    // Store validated data for controller use
    req.query = validatedData as any;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      res.status(400).json({
        success: false,
        error: 'Invalid filters',
        details: errors
      });
      return;
    }
    next(error);
  }
};

// Validate image IDs array
export const validateImageIds = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const { imageIds } = req.body;

  if (!Array.isArray(imageIds)) {
    res.status(400).json({
      success: false,
      error: 'Image IDs must be an array'
    });
    return;
  }

  if (imageIds.length === 0) {
    res.status(400).json({
      success: false,
      error: 'At least one image ID is required'
    });
    return;
  }

  // Validate each ID is a valid UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const invalidIds = imageIds.filter(id => !uuidRegex.test(id));

  if (invalidIds.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid image IDs',
      details: {
        invalidIds
      }
    });
    return;
  }

  next();
};

// Validate featured listing request
export const validateFeaturedListing = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const { durationDays } = req.body;

  if (durationDays !== undefined) {
    const duration = parseInt(durationDays);
    
    if (isNaN(duration) || duration < 1 || duration > 365) {
      res.status(400).json({
        success: false,
        error: 'Invalid duration',
        details: {
          field: 'durationDays',
          message: 'Duration must be between 1 and 365 days'
        }
      });
      return;
    }

    req.body.durationDays = duration;
  }

  next();
};

// Export enum values for frontend use
export const listingEnums = {
  provinces: CANADIAN_PROVINCES,
  bodyTypes: BODY_TYPES,
  transmissions: TRANSMISSIONS,
  fuelTypes: FUEL_TYPES,
  drivetrains: DRIVETRAINS,
  conditions: CONDITIONS
};