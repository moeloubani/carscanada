interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  province?: string;
  city?: string;
  postalCode?: string;
  isDealer?: boolean;
  dealerName?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data: UserUpdateData;
}

export class UserUpdateValidator {
  private static readonly CANADIAN_PROVINCES = [
    'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
  ];

  private static readonly POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  private static readonly PHONE_REGEX = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;

  static validate(data: any): ValidationResult {
    const errors: string[] = [];
    const cleanData: UserUpdateData = {};

    // Validate firstName
    if (data.firstName !== undefined) {
      if (typeof data.firstName !== 'string') {
        errors.push('First name must be a string');
      } else if (data.firstName.trim().length === 0) {
        errors.push('First name cannot be empty');
      } else if (data.firstName.length > 50) {
        errors.push('First name must be 50 characters or less');
      } else {
        cleanData.firstName = data.firstName.trim();
      }
    }

    // Validate lastName
    if (data.lastName !== undefined) {
      if (typeof data.lastName !== 'string') {
        errors.push('Last name must be a string');
      } else if (data.lastName.trim().length === 0) {
        errors.push('Last name cannot be empty');
      } else if (data.lastName.length > 50) {
        errors.push('Last name must be 50 characters or less');
      } else {
        cleanData.lastName = data.lastName.trim();
      }
    }

    // Validate phone
    if (data.phone !== undefined) {
      if (data.phone === null) {
        cleanData.phone = null;
      } else if (typeof data.phone !== 'string') {
        errors.push('Phone must be a string');
      } else {
        const cleanPhone = data.phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
          errors.push('Phone number must be 10 or 11 digits');
        } else if (!this.PHONE_REGEX.test(data.phone)) {
          errors.push('Invalid phone number format');
        } else {
          // Store phone in a consistent format (digits only)
          cleanData.phone = cleanPhone.length === 11 ? cleanPhone.substring(1) : cleanPhone;
        }
      }
    }

    // Validate province
    if (data.province !== undefined) {
      if (data.province === null) {
        cleanData.province = null;
      } else if (typeof data.province !== 'string') {
        errors.push('Province must be a string');
      } else {
        const upperProvince = data.province.toUpperCase().trim();
        if (!this.CANADIAN_PROVINCES.includes(upperProvince)) {
          errors.push('Invalid Canadian province code');
        } else {
          cleanData.province = upperProvince;
        }
      }
    }

    // Validate city
    if (data.city !== undefined) {
      if (data.city === null) {
        cleanData.city = null;
      } else if (typeof data.city !== 'string') {
        errors.push('City must be a string');
      } else if (data.city.trim().length === 0) {
        errors.push('City cannot be empty');
      } else if (data.city.length > 100) {
        errors.push('City must be 100 characters or less');
      } else {
        cleanData.city = data.city.trim();
      }
    }

    // Validate postal code
    if (data.postalCode !== undefined) {
      if (data.postalCode === null) {
        cleanData.postalCode = null;
      } else if (typeof data.postalCode !== 'string') {
        errors.push('Postal code must be a string');
      } else {
        const cleanPostalCode = data.postalCode.toUpperCase().replace(/\s/g, '');
        if (!this.POSTAL_CODE_REGEX.test(data.postalCode)) {
          errors.push('Invalid Canadian postal code format');
        } else {
          // Store postal code in consistent format (A1A 1A1)
          cleanData.postalCode = cleanPostalCode.slice(0, 3) + ' ' + cleanPostalCode.slice(3);
        }
      }
    }

    // Validate dealer fields
    if (data.isDealer !== undefined) {
      if (typeof data.isDealer !== 'boolean') {
        errors.push('isDealer must be a boolean');
      } else {
        cleanData.isDealer = data.isDealer;
        
        // If becoming a dealer, require dealer name
        if (data.isDealer === true) {
          if (!data.dealerName || typeof data.dealerName !== 'string' || data.dealerName.trim().length === 0) {
            errors.push('Dealer name is required for dealer accounts');
          } else if (data.dealerName.length > 100) {
            errors.push('Dealer name must be 100 characters or less');
          } else {
            cleanData.dealerName = data.dealerName.trim();
          }
        } else {
          // Clear dealer name if not a dealer
          cleanData.dealerName = null;
        }
      }
    }

    // If dealer name is provided without isDealer flag, validate it
    if (data.dealerName !== undefined && data.isDealer === undefined) {
      if (data.dealerName === null) {
        cleanData.dealerName = null;
      } else if (typeof data.dealerName !== 'string') {
        errors.push('Dealer name must be a string');
      } else if (data.dealerName.trim().length === 0) {
        errors.push('Dealer name cannot be empty');
      } else if (data.dealerName.length > 100) {
        errors.push('Dealer name must be 100 characters or less');
      } else {
        cleanData.dealerName = data.dealerName.trim();
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: cleanData
    };
  }

  static validatePasswordChange(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.currentPassword || typeof data.currentPassword !== 'string') {
      errors.push('Current password is required');
    }

    if (!data.newPassword || typeof data.newPassword !== 'string') {
      errors.push('New password is required');
    } else if (data.newPassword.length < 8) {
      errors.push('New password must be at least 8 characters long');
    } else if (data.newPassword.length > 128) {
      errors.push('New password must be 128 characters or less');
    }

    if (data.newPassword && data.currentPassword && data.newPassword === data.currentPassword) {
      errors.push('New password must be different from current password');
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: {}
    };
  }
}