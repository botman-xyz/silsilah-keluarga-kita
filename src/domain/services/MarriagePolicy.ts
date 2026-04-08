/**
 * Marriage Policy - Domain Service
 * Enforces anti-incest rules and marriage validations
 * 
 * This is a pure domain service with no external dependencies
 * Follows DDD principles for business rule enforcement
 */

import { Member } from '../entities';

/**
 * Error types for marriage violations
 */
export enum MarriageErrorCode {
  SAME_FAMILY = 'INCEST_NOT_ALLOWED_SAME_FAMILY',
  BLOOD_RELATION = 'INCEST_NOT_ALLOWED_BLOOD_RELATION',
  SELF = 'INCEST_NOT_ALLOWED_SELF',
  PARENT = 'INCEST_NOT_ALLOWED_PARENT',
  CHILD = 'INCEST_NOT_ALLOWED_CHILD',
  SIBLING = 'INCEST_NOT_ALLOWED_SIBLING',
}

/**
 * Marriage validation result
 */
export interface MarriageValidationResult {
  isValid: boolean;
  errorCode?: MarriageErrorCode;
  errorMessage?: string;
}

/**
 * MarriagePolicy - enforces marriage business rules
 */
export class MarriagePolicy {
  /**
   * Validate that two members can get married
   * Checks:
   * - Not the same person
   * - Not from the same family (anti-incest)
   * - Not blood related (parent, child, sibling, etc.)
   */
  static validateMarriage(
    memberA: Member,
    memberB: Member,
    allMembers: Member[]
  ): MarriageValidationResult {
    // Check: not same person
    if (memberA.id === memberB.id) {
      return {
        isValid: false,
        errorCode: MarriageErrorCode.SELF,
        errorMessage: 'Seseorang tidak bisa menikah dengan dirinya sendiri'
      };
    }

    // Check: not from same family
    if (memberA.familyId && memberB.familyId && memberA.familyId === memberB.familyId) {
      return {
        isValid: false,
        errorCode: MarriageErrorCode.SAME_FAMILY,
        errorMessage: 'Pasangan tidak boleh dari keluarga yang sama (hindari inses)'
      };
    }

    // Check: not a direct blood relative
    const bloodRelation = this.checkBloodRelation(memberA.id, memberB.id, allMembers);
    if (bloodRelation) {
      return {
        isValid: false,
        errorCode: MarriageErrorCode.BLOOD_RELATION,
        errorMessage: `Pasangan tidak boleh merupakan ${bloodRelation} (hindari inses)`
      };
    }

    return { isValid: true };
  }

  /**
   * Check if two members are blood related
   * Returns the relationship type if related, null if not
   */
  static checkBloodRelation(
    memberAId: string,
    memberBId: string,
    allMembers: Member[]
  ): string | null {
    const memberA = allMembers.find(m => m.id === memberAId);
    const memberB = allMembers.find(m => m.id === memberBId);
    
    if (!memberA || !memberB) return null;

    // Check: parent relationship
    if (memberA.id === memberB.fatherId || memberA.id === memberB.motherId) {
      return memberB.gender === 'male' ? 'ayah' : 'ibu';
    }
    if (memberB.id === memberA.fatherId || memberB.id === memberA.motherId) {
      return memberA.gender === 'male' ? 'ayah' : 'ibu';
    }

    // Check: child relationship
    if (memberA.fatherId === memberB.id || memberA.motherId === memberB.id) {
      return memberA.gender === 'male' ? 'anak laki-laki' : 'anak perempuan';
    }
    if (memberB.fatherId === memberA.id || memberB.motherId === memberA.id) {
      return memberB.gender === 'male' ? 'anak laki-laki' : 'anak perempuan';
    }

    // Check: sibling relationship (same parents)
    if (
      (memberA.fatherId && memberA.fatherId === memberB.fatherId) ||
      (memberA.motherId && memberA.motherId === memberB.motherId)
    ) {
      return 'saudara kandung';
    }

    // Check: grandparent/grandchild
    if (this.isAncestorOf(memberA.id, memberB.id, allMembers, 2)) {
      return 'kakek/nenek';
    }
    if (this.isAncestorOf(memberB.id, memberA.id, allMembers, 2)) {
      return 'kakek/nenek';
    }

    // Check: uncle/aunt - sibling of parent
    if (this.isUncleOrAunt(memberA.id, memberB.id, allMembers)) {
      return 'paman/bibi';
    }
    if (this.isUncleOrAunt(memberB.id, memberA.id, allMembers)) {
      return 'paman/bibi';
    }

    return null;
  }

  /**
   * Check if memberA is an ancestor of memberB within maxDepth generations
   */
  private static isAncestorOf(
    ancestorId: string,
    descendantId: string,
    members: Member[],
    maxDepth: number
  ): boolean {
    let currentId: string | undefined = descendantId;
    let depth = 0;

    while (currentId && depth < maxDepth) {
      const member = members.find(m => m.id === currentId);
      if (!member) break;

      if (member.fatherId === ancestorId || member.motherId === ancestorId) {
        return true;
      }

      currentId = member.fatherId || member.motherId;
      depth++;
    }

    return false;
  }

  /**
   * Check if memberA is uncle/aunt of memberB (sibling of parent)
   */
  private static isUncleOrAunt(
    uncleAuntId: string,
    nieceNephewId: string,
    members: Member[]
  ): boolean {
    const nieceNephew = members.find(m => m.id === nieceNephewId);
    if (!nieceNephew) return false;

    // Get parents of the niece/nephew
    const parentIds = [nieceNephew.fatherId, nieceNephew.motherId].filter(Boolean);
    if (parentIds.length === 0) return false;

    // Check if uncle/aunt is sibling of either parent
    for (const parentId of parentIds) {
      const parent = members.find(m => m.id === parentId);
      if (!parent) continue;

      // Check if uncle/aunt shares a parent with the parent (is parent's sibling)
      if (
        (parent.fatherId && this.hasSameParent(uncleAuntId, parent.fatherId, members)) ||
        (parent.motherId && this.hasSameParent(uncleAuntId, parent.motherId, members))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if two members share the same parent
   */
  private static hasSameParent(
    memberAId: string,
    parentId: string,
    members: Member[]
  ): boolean {
    const memberA = members.find(m => m.id === memberAId);
    if (!memberA) return false;

    return memberA.fatherId === parentId || memberA.motherId === parentId;
  }

  /**
   * Build family graph for relationship traversal
   * This creates an adjacency list for BFS/DFS traversal
   */
  static buildFamilyGraph(members: Member[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    members.forEach(m => {
      if (!graph.has(m.id)) graph.set(m.id, new Set());

      // Add parent relationships (bidirectional)
      if (m.fatherId) {
        if (!graph.has(m.fatherId)) graph.set(m.fatherId, new Set());
        graph.get(m.id)!.add(m.fatherId);
        graph.get(m.fatherId)!.add(m.id);
      }
      if (m.motherId) {
        if (!graph.has(m.motherId)) graph.set(m.motherId, new Set());
        graph.get(m.id)!.add(m.motherId);
        graph.get(m.motherId)!.add(m.id);
      }
      // Add spouse relationship (bidirectional)
      if (m.spouseId) {
        if (!graph.has(m.spouseId)) graph.set(m.spouseId, new Set());
        graph.get(m.id)!.add(m.spouseId);
        graph.get(m.spouseId)!.add(m.id);
      }
      // Add sibling relationships through common parents
      if (m.fatherId) {
        const siblings = members.filter(sib => 
          sib.id !== m.id && sib.fatherId === m.fatherId
        );
        siblings.forEach(sib => {
          graph.get(m.id)!.add(sib.id);
          graph.get(sib.id)!.add(m.id);
        });
      }
      if (m.motherId) {
        const siblings = members.filter(sib => 
          sib.id !== m.id && sib.motherId === m.motherId
        );
        siblings.forEach(sib => {
          graph.get(m.id)!.add(sib.id);
          graph.get(sib.id)!.add(m.id);
        });
      }
    });

    return graph;
  }

  /**
   * Check if two members are blood related using graph traversal
   * Uses BFS to find relationship path
   */
  static isBloodRelated(
    memberAId: string,
    memberBId: string,
    members: Member[]
  ): boolean {
    const graph = this.buildFamilyGraph(members);
    const visited = new Set<string>();
    const queue: string[] = [memberAId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (currentId === memberBId) return true;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);

      const neighbors = graph.get(currentId);
      if (neighbors) {
        for (const neighborId of neighbors) {
          if (!visited.has(neighborId)) {
            queue.push(neighborId);
          }
        }
      }
    }

    return false;
  }
}

/**
 * Helper function to get error message for marriage error code
 */
export function getMarriageErrorMessage(errorCode: MarriageErrorCode): string {
  const messages: Record<MarriageErrorCode, string> = {
    [MarriageErrorCode.SAME_FAMILY]: 'Pasangan tidak boleh dari keluarga yang sama',
    [MarriageErrorCode.BLOOD_RELATION]: 'Pasangan tidak boleh memiliki hubungan darah',
    [MarriageErrorCode.SELF]: 'Seseorang tidak bisa menikah dengan dirinya sendiri',
    [MarriageErrorCode.PARENT]: 'Pasangan tidak boleh merupakan orang tua',
    [MarriageErrorCode.CHILD]: 'Pasangan tidak boleh merupakan anak',
    [MarriageErrorCode.SIBLING]: 'Pasangan tidak boleh merupakan saudara kandung',
  };
  
  return messages[errorCode] || 'Peraturan pernikahan tidak terpenuhi';
}
