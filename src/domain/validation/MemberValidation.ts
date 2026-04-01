/**
 * Member Validation Schemas
 * Zod schemas for validating member data
 */

import { z } from 'zod';

/**
 * Gender enum schema
 */
export const GenderSchema = z.enum(['male', 'female', 'other'], {
  errorMap: () => ({ message: 'Gender must be male, female, or other' })
});

/**
 * Marital status enum schema
 */
export const MaritalStatusSchema = z.enum(
  ['single', 'married', 'divorced', 'widowed'],
  {
    errorMap: () => ({
      message: 'Marital status must be single, married, divorced, or widowed'
    })
  }
);

/**
 * Member name schema
 */
export const MemberNameSchema = z
  .string()
  .min(1, 'Member name is required')
  .max(100, 'Member name must be 100 characters or less')
  .trim();

/**
 * Birth date schema
 */
export const BirthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format')
  .refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: 'Invalid birth date' }
  )
  .optional();

/**
 * Death date schema
 */
export const DeathDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Death date must be in YYYY-MM-DD format')
  .refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: 'Invalid death date' }
  )
  .optional();

/**
 * Marriage date schema
 */
export const MarriageDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Marriage date must be in YYYY-MM-DD format')
  .refine(
    (date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    },
    { message: 'Invalid marriage date' }
  )
  .optional();

/**
 * Bio schema
 */
export const BioSchema = z
  .string()
  .max(1000, 'Bio must be 1000 characters or less')
  .optional();

/**
 * Photo URL schema
 */
export const PhotoUrlSchema = z
  .string()
  .url('Invalid photo URL')
  .optional();

/**
 * Create member schema
 */
export const CreateMemberSchema = z
  .object({
    familyId: z.string().min(1, 'Family ID is required'),
    name: MemberNameSchema,
    gender: GenderSchema,
    birthDate: BirthDateSchema,
    deathDate: DeathDateSchema,
    fatherId: z.string().optional(),
    motherId: z.string().optional(),
    spouseId: z.string().optional(),
    maritalStatus: MaritalStatusSchema.optional(),
    marriageDate: MarriageDateSchema,
    bio: BioSchema,
    photoUrl: PhotoUrlSchema
  })
  .refine(
    (data) => {
      // Validate that death date is after birth date
      if (data.birthDate && data.deathDate) {
        const birth = new Date(data.birthDate);
        const death = new Date(data.deathDate);
        return death > birth;
      }
      return true;
    },
    {
      message: 'Death date must be after birth date',
      path: ['deathDate']
    }
  )
  .refine(
    (data) => {
      // Validate that marriage date is after birth date
      if (data.birthDate && data.marriageDate) {
        const birth = new Date(data.birthDate);
        const marriage = new Date(data.marriageDate);
        return marriage > birth;
      }
      return true;
    },
    {
      message: 'Marriage date must be after birth date',
      path: ['marriageDate']
    }
  );

/**
 * Update member schema
 */
export const UpdateMemberSchema = z
  .object({
    familyId: z.string().min(1, 'Family ID is required'),
    memberId: z.string().min(1, 'Member ID is required'),
    name: MemberNameSchema.optional(),
    gender: GenderSchema.optional(),
    birthDate: BirthDateSchema,
    deathDate: DeathDateSchema,
    fatherId: z.string().optional(),
    motherId: z.string().optional(),
    spouseId: z.string().optional(),
    maritalStatus: MaritalStatusSchema.optional(),
    marriageDate: MarriageDateSchema,
    bio: BioSchema,
    photoUrl: PhotoUrlSchema
  })
  .refine(
    (data) => {
      // Validate that death date is after birth date
      if (data.birthDate && data.deathDate) {
        const birth = new Date(data.birthDate);
        const death = new Date(data.deathDate);
        return death > birth;
      }
      return true;
    },
    {
      message: 'Death date must be after birth date',
      path: ['deathDate']
    }
  )
  .refine(
    (data) => {
      // Validate that marriage date is after birth date
      if (data.birthDate && data.marriageDate) {
        const birth = new Date(data.birthDate);
        const marriage = new Date(data.marriageDate);
        return marriage > birth;
      }
      return true;
    },
    {
      message: 'Marriage date must be after birth date',
      path: ['marriageDate']
    }
  );

/**
 * Delete member schema
 */
export const DeleteMemberSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  memberId: z.string().min(1, 'Member ID is required')
});

/**
 * Set parents schema
 */
export const SetParentsSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  fatherId: z.string().optional(),
  motherId: z.string().optional()
});

/**
 * Set spouse schema
 */
export const SetSpouseSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  spouseId: z.string().min(1, 'Spouse ID is required'),
  isPrimary: z.boolean().optional(),
  marriageDate: MarriageDateSchema
});

/**
 * Remove spouse schema
 */
export const RemoveSpouseSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  spouseId: z.string().min(1, 'Spouse ID is required')
});

/**
 * Type exports
 */
export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
export type DeleteMemberInput = z.infer<typeof DeleteMemberSchema>;
export type SetParentsInput = z.infer<typeof SetParentsSchema>;
export type SetSpouseInput = z.infer<typeof SetSpouseSchema>;
export type RemoveSpouseInput = z.infer<typeof RemoveSpouseSchema>;
