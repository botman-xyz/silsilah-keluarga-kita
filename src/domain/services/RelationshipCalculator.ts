/**
 * Domain Relationship Calculator Service
 * Pure business logic for calculating family relationships
 * No external dependencies
 */

import { Member } from '../entities';

export interface RelationshipResult {
  label: string;
  path: Member[];
}

/**
 * Builds a relationship graph from members
 */
export const buildRelationshipGraph = (members: Member[]): Map<string, Set<string>> => {
  const graph = new Map<string, Set<string>>();
  
  members.forEach(m => {
    if (!graph.has(m.id)) graph.set(m.id, new Set());
    
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
    if (m.spouseId) {
      if (!graph.has(m.spouseId)) graph.set(m.spouseId, new Set());
      graph.get(m.id)!.add(m.spouseId);
      graph.get(m.spouseId)!.add(m.id);
    }
  });
  
  return graph;
};

/**
 * Find shortest path between two members using BFS
 */
export const findRelationshipPath = (
  member1Id: string,
  member2Id: string,
  members: Member[]
): string[] | null => {
  if (member1Id === member2Id) return [];
  
  const graph = buildRelationshipGraph(members);
  const queue: [string, string[]][] = [[member1Id, []]];
  const visited = new Set<string>([member1Id]);
  
  while (queue.length > 0) {
    const [currentId, path] = queue.shift()!;
    
    if (currentId === member2Id) {
      return [...path, currentId];
    }
    
    const neighbors = graph.get(currentId) || new Set();
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([neighborId, [...path, currentId]]);
      }
    }
  }
  
  return null;
};

/**
 * Describes the relationship path between two members
 */
export const describePath = (
  path: string[],
  start: Member,
  end: Member,
  all: Member[]
): string => {
  const distance = path.length;
  
  // Same person
  if (distance === 0) return "Orang yang sama";
  
  // Direct relationships (1 hop)
  if (distance === 1) {
    if (start.fatherId === end.id || start.motherId === end.id) {
      return `${end.name} adalah Orang Tua dari ${start.name}`;
    }
    if (end.fatherId === start.id || end.motherId === start.id) {
      return `${start.name} adalah Orang Tua dari ${end.name}`;
    }
    if (start.spouseId === end.id) return "Suami/Istri";
    if (start.fatherId === end.fatherId && start.motherId === end.motherId) {
      return "Saudara Kandung";
    }
  }
  
  // Grandparents (2 hops)
  if (distance === 2) {
    const mid = all.find(m => m.id === path[1]);
    if (mid) {
      // end is grandparent of start
      if ((start.fatherId === mid.id || start.motherId === mid.id) && 
          (mid.fatherId === end.id || mid.motherId === end.id)) {
        return `${end.name} adalah Kakek/Nenek dari ${start.name}`;
      }
      // start is grandparent of end
      if ((end.fatherId === mid.id || end.motherId === mid.id) && 
          (mid.fatherId === start.id || mid.motherId === start.id)) {
        return `${start.name} adalah Kakek/Nenek dari ${end.name}`;
      }
    }
  }
  
  // Uncles/Aunts / Nephews/Nieces (2 hops)
  if (distance === 2) {
    const mid = all.find(m => m.id === path[1]);
    if (mid) {
      // Uncle/Aunt: mid is parent of start, end is sibling of mid
      if ((start.fatherId === mid.id || start.motherId === mid.id) && 
          ((mid.fatherId && mid.fatherId === end.fatherId) || (mid.motherId && mid.motherId === end.motherId))) {
        return `${end.name} adalah Paman/Bibi dari ${start.name}`;
      }
      // Nephew/Niece: start is sibling of mid, mid is parent of end
      if (((start.fatherId && start.fatherId === mid.fatherId) || (start.motherId && start.motherId === mid.motherId)) &&
          (end.fatherId === mid.id || end.motherId === mid.id)) {
        return `${end.name} adalah Keponakan dari ${start.name}`;
      }
    }
  }
  
  // Siblings (3 hops through shared parent)
  if (distance === 3) {
    const mid = all.find(m => m.id === path[1]);
    if (mid) {
      // Check if mid is a shared parent of both start and end
      if ((start.fatherId === mid.id || start.motherId === mid.id) &&
          (end.fatherId === mid.id || end.motherId === mid.id)) {
        return "Saudara Kandung";
      }
    }
  }
  
  // Cousins (3 hops)
  if (distance === 3) {
    const mid1 = all.find(m => m.id === path[1]);
    const mid2 = all.find(m => m.id === path[2]);
    if (mid1 && mid2) {
      if ((start.fatherId === mid1.id || start.motherId === mid1.id) &&
          (end.fatherId === mid2.id || end.motherId === mid2.id) &&
          ((mid1.fatherId && mid1.fatherId === mid2.fatherId) || (mid1.motherId && mid1.motherId === mid2.motherId))) {
        return "Sepupu";
      }
    }
  }
  
  // Menantu (in-law) relationships
  if (distance === 2) {
    const mid = all.find(m => m.id === path[1]);
    if (mid) {
      // Menantu: end is spouse of start's child
      if (end.spouseId === mid.id && (start.fatherId === mid.id || start.motherId === mid.id)) {
        return `${end.name} adalah Menantu dari ${start.name}`;
      }
      // Menantu: start is spouse of end's child
      if (start.spouseId === mid.id && (end.fatherId === mid.id || end.motherId === mid.id)) {
        return `${start.name} adalah Menantu dari ${end.name}`;
      }
      // Mertua (in-law parent): end is parent of start's spouse
      if (start.spouseId === mid.id && (mid.fatherId === end.id || mid.motherId === end.id)) {
        return `${end.name} adalah Mertua dari ${start.name}`;
      }
      // Mertua (in-law parent): start is parent of end's spouse
      if (end.spouseId === mid.id && (mid.fatherId === start.id || mid.motherId === start.id)) {
        return `${start.name} adalah Mertua dari ${end.name}`;
      }
    }
  }
  
  // Ipar (sibling-in-law) relationships
  if (distance === 2) {
    const mid = all.find(m => m.id === path[1]);
    if (mid) {
      // Ipar: end is spouse of start's sibling
      if (end.spouseId === mid.id && 
          ((start.fatherId && start.fatherId === mid.fatherId) || (start.motherId && start.motherId === mid.motherId))) {
        return `${end.name} adalah Ipar dari ${start.name}`;
      }
      // Ipar: start is spouse of end's sibling
      if (start.spouseId === mid.id && 
          ((end.fatherId && end.fatherId === mid.fatherId) || (end.motherId && end.motherId === mid.motherId))) {
        return `${start.name} adalah Ipar dari ${end.name}`;
      }
    }
  }
  
  return `Terhubung melalui ${distance} tingkatan silsilah`;
};

/**
 * Main function: Calculate relationship between two members
 */
export const calculateRelationship = (
  member1Id: string,
  member2Id: string,
  members: Member[]
): RelationshipResult => {
  // Same person
  if (member1Id === member2Id) {
    return { label: "Orang yang sama", path: [] };
  }
  
  const m1 = members.find(m => m.id === member1Id);
  const m2 = members.find(m => m.id === member2Id);
  if (!m1 || !m2) {
    return { label: "Anggota tidak ditemukan", path: [] };
  }
  
  const path = findRelationshipPath(member1Id, member2Id, members);
  
  if (!path) {
    return { label: "Hubungan Jauh atau Belum Terhubung", path: [] };
  }
  
  const pathMembers = path.map(id => members.find(m => m.id === id)!).filter(Boolean);
  const label = describePath(path, m1, m2, members);
  
  return { label, path: pathMembers };
};

export default {
  buildRelationshipGraph,
  findRelationshipPath,
  describePath,
  calculateRelationship
};