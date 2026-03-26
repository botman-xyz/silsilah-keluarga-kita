import { useState, useEffect } from 'react';
import { Family, Member } from '../../domain/entities';
import { memberService } from '../../infrastructure';

interface UseMembersOptions {
  families?: Family[];
}

interface UseMembersResult {
  allMembers: Member[];
  members: Member[];
  createMember: (familyId: string, data: Omit<Member, 'id'>) => Promise<Member>;
  updateMember: (familyId: string, memberId: string, data: Partial<Member>) => Promise<void>;
  deleteMember: (familyId: string, memberId: string) => Promise<void>;
}

/**
 * Hook for managing members using clean architecture
 */
export function useMembers({ families = [] }: UseMembersOptions = {}): UseMembersResult {
  const [allMembers, setAllMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (families.length === 0) {
      setAllMembers([]);
      return;
    }

    const familyIds = families.map(f => f.id);
    
    const unsubscribe = memberService.subscribeToMembersByFamilies(familyIds, (members) => {
      setAllMembers(members);
    });

    return () => unsubscribe();
  }, [families.map(f => f.id).join(',')]);

  // Calculate members for selected family
  const members = families.length > 0 ? allMembers : [];

  return { 
    allMembers, 
    members,
    createMember: (familyId: string, data: Omit<Member, 'id'>) => memberService.createMember(familyId, data),
    updateMember: (familyId: string, memberId: string, data: Partial<Member>) => memberService.updateMember(familyId, memberId, data),
    deleteMember: (familyId: string, memberId: string) => memberService.deleteMember(familyId, memberId)
  };
}
