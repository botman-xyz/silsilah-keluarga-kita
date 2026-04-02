// Member form validation utilities
// Extracted for better maintainability and reusability

import { Member } from '../../domain/entities';

export interface FormErrors {
  name?: string;
  birthDate?: string;
  deathDate?: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  externalFamilyId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

/**
 * Validate member form data
 */
export function validateMemberForm(
  formData: Partial<Member>,
  allMembers: Member[]
): ValidationResult {
  const errors: FormErrors = {};
  
  // Name validation
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = 'Nama lengkap harus diisi';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Nama harus minimal 2 karakter';
  }
  
  // Birth date validation
  if (formData.birthDate) {
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (birthDate > today) {
      errors.birthDate = 'Tanggal lahir tidak boleh di masa depan';
    }
  }
  
  // Death date validation
  if (formData.deathDate && formData.birthDate) {
    const birthDate = new Date(formData.birthDate);
    const deathDate = new Date(formData.deathDate);
    if (deathDate < birthDate) {
      errors.deathDate = 'Tanggal wafat harus setelah tanggal lahir';
    }
  }
  
  // Father gender validation
  if (formData.fatherId) {
    const father = allMembers.find(m => m.id === formData.fatherId);
    if (father && father.gender !== 'male') {
      errors.fatherId = 'Ayah harus berjenis kelamin laki-laki';
    }
    if (father && formData.id && father.id === formData.id) {
      errors.fatherId = 'Seseorang tidak bisa menjadi ayah bagi dirinya sendiri';
    }
  }
  
  // Mother gender validation
  if (formData.motherId) {
    const mother = allMembers.find(m => m.id === formData.motherId);
    if (mother && mother.gender !== 'female') {
      errors.motherId = 'Ibu harus berjenis kelamin perempuan';
    }
    if (mother && formData.id && mother.id === formData.id) {
      errors.motherId = 'Seseorang tidak bisa menjadi ibu bagi dirinya sendiri';
    }
  }
  
  // Spouse cannot be self
  if (formData.spouseId && formData.id && formData.spouseId === formData.id) {
    errors.spouseId = 'Seseorang tidak bisa menjadi pasangan bagi dirinya sendiri';
  }
  
  // Menantu (in-law) validation
  if (formData.externalFamilyId && formData.spouseId) {
    const spouse = allMembers.find(m => m.id === formData.spouseId);
    if (spouse && spouse.familyId === formData.externalFamilyId) {
      errors.spouseId = 'Pasangan tidak boleh dari keluarga yang sama dengan keluarga asal menantu';
    }
  }
  
  // Validate externalFamilyId is different from familyId for menantu
  if (formData.externalFamilyId && formData.familyId && formData.externalFamilyId === formData.familyId) {
    errors.externalFamilyId = 'Keluarga asal menantu harus berbeda dengan keluarga saat ini';
  }
  
  // Auto-set maritalStatus to 'married' if spouseId is set
  if (formData.spouseId && formData.maritalStatus !== 'married') {
    formData.maritalStatus = 'married';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Get default form data for a new member
 */
export function getDefaultFormData(): Partial<Member> {
  return {
    name: '',
    gender: 'male',
    fatherId: '',
    motherId: '',
    isAdoptedChild: false,
    spouseId: '',
    spouseIds: [],
    externalSpouseName: '',
    externalFamilyId: '',
    marriageDate: '',
    maritalStatus: 'single',
    createdBy: '',
    updatedAt: ''
  };
}

/**
 * Map form data to member object
 */
export function mapFormToMember(formData: Partial<Member>, existingMember?: Member): Partial<Member> {
  return {
    ...existingMember,
    ...formData,
    // Clear empty strings to undefined
    fatherId: formData.fatherId || undefined,
    motherId: formData.motherId || undefined,
    spouseId: formData.spouseId || undefined,
    externalSpouseName: formData.externalSpouseName || undefined,
    externalFamilyId: formData.externalFamilyId || undefined,
    birthDate: formData.birthDate || undefined,
    deathDate: formData.deathDate || undefined,
    ...(formData.marriageDate ? { marriageDate: formData.marriageDate } : {}),
    photoUrl: formData.photoUrl || undefined,
    bio: formData.bio || undefined
  };
}