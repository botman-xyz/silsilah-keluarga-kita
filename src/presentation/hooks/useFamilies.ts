import { useState, useEffect } from 'react';
import { Family } from '../../domain/entities';
import { familyService } from '../../infrastructure';

interface UseFamiliesOptions {
  userId?: string;
  selectedFamilyId?: string;
  onFamilySelected?: (family: Family) => void;
}

interface UseFamiliesResult {
  families: Family[];
  selectedFamily: Family | null;
  setSelectedFamily: (family: Family | null) => void;
  createFamily: (name: string, ownerId: string) => Promise<Family>;
  updateFamily: (familyId: string, data: Partial<Family>) => Promise<void>;
  deleteFamily: (familyId: string) => Promise<void>;
  addCollaborator: (familyId: string, userId: string) => Promise<void>;
  removeCollaborator: (familyId: string, userId: string) => Promise<void>;
}

/**
 * Hook for managing families using clean architecture
 */
export function useFamilies({ userId, selectedFamilyId, onFamilySelected }: UseFamiliesOptions = {}): UseFamiliesResult {
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = familyService.subscribeToAllAccessibleFamilies(userId, (allFamilies) => {
      setFamilies(allFamilies);
      
      // Auto-select first family if none selected
      if (allFamilies.length > 0 && !selectedFamily && onFamilySelected) {
        onFamilySelected(allFamilies[0]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Sync selected family when selectedFamilyId changes
  useEffect(() => {
    if (selectedFamilyId && families.length > 0) {
      const family = families.find(f => f.id === selectedFamilyId);
      if (family) {
        setSelectedFamily(family);
      }
    }
  }, [selectedFamilyId, families]);

  return { 
    families, 
    selectedFamily, 
    setSelectedFamily,
    createFamily: (name: string, ownerId: string) => familyService.createFamily({ name, ownerId }),
    updateFamily: (familyId: string, data: Partial<Family>) => familyService.updateFamily(familyId, data),
    deleteFamily: (familyId: string) => familyService.deleteFamily(familyId),
    addCollaborator: (familyId: string, userId: string) => familyService.addCollaborator(familyId, userId),
    removeCollaborator: (familyId: string, userId: string) => familyService.removeCollaborator(familyId, userId)
  };
}
