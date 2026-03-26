/**
 * DDD Value Objects
 * These represent immutable value types in the domain
 */

// =========================================
// 📅 DATE VALUE OBJECTS
// =========================================

/**
 * Value object for date of birth
 * Encapsulates date validation and formatting
 */
export class BirthDate {
  private readonly value: string | undefined;

  constructor(dateString?: string) {
    // Validate date if provided
    if (dateString && isNaN(Date.parse(dateString))) {
      throw new Error('Invalid birth date format');
    }
    this.value = dateString;
  }

  getValue(): string | undefined {
    return this.value;
  }

  hasValue(): boolean {
    return !!this.value;
  }

  toDate(): Date | null {
    return this.value ? new Date(this.value) : null;
  }

  /**
   * Calculate age from birth date
   */
  calculateAge(endDate: Date = new Date()): number | null {
    if (!this.value) return null;
    const birth = new Date(this.value);
    let age = endDate.getFullYear() - birth.getFullYear();
    const monthDiff = endDate.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
}

/**
 * Value object for date of death
 */
export class DeathDate {
  private readonly value: string | undefined;

  constructor(dateString?: string) {
    if (dateString && isNaN(Date.parse(dateString))) {
      throw new Error('Invalid death date format');
    }
    this.value = dateString;
  }

  getValue(): string | undefined {
    return this.value;
  }

  hasValue(): boolean {
    return !!this.value;
  }

  toDate(): Date | null {
    return this.value ? new Date(this.value) : null;
  }
}

// =========================================
// 👤 ID VALUE OBJECTS
// =========================================

/**
 * Value object for Member ID
 * Ensures type safety and validation
 */
export class MemberId {
  private readonly value: string;

  constructor(id: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('Member ID cannot be empty');
    }
    this.value = id;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: MemberId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Value object for Family ID
 */
export class FamilyId {
  private readonly value: string;

  constructor(id: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('Family ID cannot be empty');
    }
    this.value = id;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: FamilyId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// =========================================
// 🏠 FAMILY VALUE OBJECTS
// =========================================

/**
 * Value object for Family Name
 * Encapsulates naming rules and validation
 */
export class FamilyName {
  private readonly value: string;

  constructor(name: string) {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new Error('Family name cannot be empty');
    }
    if (trimmed.length > 100) {
      throw new Error('Family name cannot exceed 100 characters');
    }
    this.value = trimmed;
  }

  getValue(): string {
    return this.value;
  }

  /**
   * Normalize for comparison (lowercase, trimmed)
   */
  normalized(): string {
    return this.value.toLowerCase();
  }

  equals(other: FamilyName): boolean {
    return this.normalized() === other.normalized();
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Value object for Collaborator List
 */
export class Collaborators {
  private readonly value: string[];

  constructor(collaborators: string[] = []) {
    this.value = [...new Set(collaborators)]; // Remove duplicates
  }

  getValue(): string[] {
    return [...this.value];
  }

  hasCollaborator(userId: string): boolean {
    return this.value.includes(userId);
  }

  add(userId: string): Collaborators {
    if (this.hasCollaborator(userId)) {
      return this;
    }
    return new Collaborators([...this.value, userId]);
  }

  remove(userId: string): Collaborators {
    return new Collaborators(this.value.filter(id => id !== userId));
  }

  count(): number {
    return this.value.length;
  }
}

// =========================================
// 👥 MEMBER VALUE OBJECTS
// =========================================

/**
 * Value object for Gender
 */
export type GenderValue = 'male' | 'female' | 'other';

export class Gender {
  private readonly value: GenderValue;

  constructor(value: GenderValue) {
    if (!['male', 'female', 'other'].includes(value)) {
      throw new Error('Invalid gender value');
    }
    this.value = value;
  }

  getValue(): GenderValue {
    return this.value;
  }

  isMale(): boolean {
    return this.value === 'male';
  }

  isFemale(): boolean {
    return this.value === 'female';
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Value object for Marital Status
 */
export type MaritalStatusValue = 'single' | 'married' | 'divorced' | 'widowed';

export class MaritalStatus {
  private readonly value: MaritalStatusValue;

  constructor(value: MaritalStatusValue) {
    if (!['single', 'married', 'divorced', 'widowed'].includes(value)) {
      throw new Error('Invalid marital status value');
    }
    this.value = value;
  }

  getValue(): MaritalStatusValue {
    return this.value;
  }

  isMarried(): boolean {
    return this.value === 'married';
  }

  isSingle(): boolean {
    return this.value === 'single';
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Value object for Member Name
 */
export class MemberName {
  private readonly value: string;

  constructor(name: string) {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      throw new Error('Member name cannot be empty');
    }
    if (trimmed.length > 100) {
      throw new Error('Member name cannot exceed 100 characters');
    }
    this.value = trimmed;
  }

  getValue(): string {
    return this.value;
  }

  normalized(): string {
    return this.value.toLowerCase();
  }

  equals(other: MemberName): boolean {
    return this.normalized() === other.normalized();
  }

  toString(): string {
    return this.value;
  }
}

/**
 * Value object for Spouse IDs
 * Handles multiple spouse support
 */
export class SpouseIds {
  private readonly value: string[];
  private readonly primary: string | undefined;

  constructor(spouseIds: string[] = [], primary?: string) {
    this.value = [...new Set(spouseIds)];
    this.primary = primary && this.value.includes(primary) ? primary : this.value[0];
  }

  getValue(): string[] {
    return [...this.value];
  }

  getPrimary(): string | undefined {
    return this.primary;
  }

  hasSpouse(spouseId: string): boolean {
    return this.value.includes(spouseId);
  }

  add(spouseId: string): SpouseIds {
    if (this.hasSpouse(spouseId)) {
      return this;
    }
    const newIds = [...this.value, spouseId];
    return new SpouseIds(newIds, this.primary || spouseId);
  }

  remove(spouseId: string): SpouseIds {
    const newIds = this.value.filter(id => id !== spouseId);
    return new SpouseIds(newIds, this.primary === spouseId ? newIds[0] : this.primary);
  }

  count(): number {
    return this.value.length;
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }
}

// =========================================
// 🔗 RELATIONSHIP VALUE OBJECTS
// =========================================

/**
 * Value object for Parent IDs (father/mother)
 */
export class ParentIds {
  private readonly fatherId: string | undefined;
  private readonly motherId: string | undefined;

  constructor(fatherId?: string, motherId?: string) {
    this.fatherId = fatherId;
    this.motherId = motherId;
  }

  getFatherId(): string | undefined {
    return this.fatherId;
  }

  getMotherId(): string | undefined {
    return this.motherId;
  }

  hasFather(): boolean {
    return !!this.fatherId;
  }

  hasMother(): boolean {
    return !!this.motherId;
  }

  hasParents(): boolean {
    return this.hasFather() && this.hasMother();
  }

  setFather(id: string | undefined): ParentIds {
    return new ParentIds(id, this.motherId);
  }

  setMother(id: string | undefined): ParentIds {
    return new ParentIds(this.fatherId, id);
  }
}

// =========================================
// 📊 MEDIA VALUE OBJECTS
// =========================================

/**
 * Value object for Member Media (photos, documents)
 */
export interface MediaItem {
  url: string;
  type: 'image' | 'document';
  name: string;
}

export class MediaCollection {
  private readonly items: MediaItem[];

  constructor(items: MediaItem[] = []) {
    this.items = items;
  }

  getItems(): MediaItem[] {
    return [...this.items];
  }

  getImages(): MediaItem[] {
    return this.items.filter(item => item.type === 'image');
  }

  getDocuments(): MediaItem[] {
    return this.items.filter(item => item.type === 'document');
  }

  add(item: MediaItem): MediaCollection {
    return new MediaCollection([...this.items, item]);
  }

  remove(url: string): MediaCollection {
    return new MediaCollection(this.items.filter(item => item.url !== url));
  }

  count(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}