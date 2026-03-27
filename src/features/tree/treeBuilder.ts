/**
 * Tree Data Builder
 * Builds hierarchical tree data from flat member list
 */

import { Member } from '../../domain/entities';

export interface TreeNode {
  id: string;
  type: 'couple' | 'individual' | 'virtual';
  member?: Member;
  spouse?: Member;
  children: TreeNode[];
  isVirtual?: boolean;
  name?: string;
}

/**
 * Build hierarchy from members
 */
export const buildTreeHierarchy = (
  members: Member[]
): TreeNode => {
  const memberMap = new Map(members.map(m => [m.id, m]));
  const coveredMembers = new Set<string>();
  
  const buildHierarchy = (
    memberId: string,
    parentPath: string = "root",
    visited: Set<string> = new Set()
  ): TreeNode[] => {
    // Prevent infinite recursion
    if (visited.has(memberId)) return [];
    
    const member = memberMap.get(memberId);
    if (!member) return [];

    const newVisited = new Set(visited);
    newVisited.add(memberId);
    
    // Get all spouses
    const spouseIds = new Set<string>();
    if (member.spouseId) spouseIds.add(member.spouseId);
    if (member.spouseIds) member.spouseIds.forEach(id => spouseIds.add(id));
    
    // Find children
    const allChildren = members.filter(m => m.fatherId === member.id || m.motherId === member.id);
    
    // Group children by their "other" parent
    const childrenByOtherParent = new Map<string, Member[]>();
    const childrenWithNoOtherParent: Member[] = [];
    
    allChildren.forEach(child => {
      const otherParentId = child.fatherId === member.id ? child.motherId : child.fatherId;
      if (otherParentId && spouseIds.has(otherParentId)) {
        if (!childrenByOtherParent.has(otherParentId)) childrenByOtherParent.set(otherParentId, []);
        childrenByOtherParent.get(otherParentId)!.push(child);
      } else {
        childrenWithNoOtherParent.push(child);
      }
    });

    const nodes: TreeNode[] = [];

    // Create couple nodes
    spouseIds.forEach(spouseId => {
      if (!memberMap.has(spouseId)) return;
      const spouse = memberMap.get(spouseId)!;
      const coupleChildren = childrenByOtherParent.get(spouseId) || [];
      
      if (coupleChildren.length > 0 || member.spouseId === spouseId) {
        const node: TreeNode = {
          id: `${parentPath}_${member.id}_${spouse.id}`,
          type: 'couple',
          member: member,
          spouse: spouse,
          children: []
        };
        
        coupleChildren.forEach(child => {
          const childNodes = buildHierarchy(child.id, node.id, newVisited);
          node.children.push(...childNodes);
        });
        
        nodes.push(node);
        coveredMembers.add(memberId);
        coveredMembers.add(spouseId);
      }
    });

    // Create individual node if no couple nodes or has children with no other parent
    if (nodes.length === 0 || childrenWithNoOtherParent.length > 0) {
      const node: TreeNode = {
        id: `${parentPath}_${member.id}`,
        type: 'individual',
        member: member,
        children: []
      };
      
      childrenWithNoOtherParent.forEach(child => {
        const childNodes = buildHierarchy(child.id, node.id, newVisited);
        node.children.push(...childNodes);
      });
      
      nodes.push(node);
      coveredMembers.add(memberId);
    }

    return nodes;
  };

  // Virtual root
  const virtualRoot: TreeNode = {
    id: 'VIRTUAL_ROOT',
    name: 'Root',
    type: 'virtual',
    isVirtual: true,
    children: []
  };

  // Find roots (people without parents in the list)
  const roots = members.filter(m => 
    (!m.fatherId || !memberMap.has(m.fatherId)) && 
    (!m.motherId || !memberMap.has(m.motherId))
  );

  const startRoots = roots.length > 0 ? roots : (members.length > 0 ? [members[0]] : []);
  
  startRoots.forEach(r => {
    if (!coveredMembers.has(r.id)) {
      const trees = buildHierarchy(r.id);
      virtualRoot.children.push(...trees);
    }
  });

  // Catch disconnected members
  members.forEach(m => {
    if (!coveredMembers.has(m.id)) {
      const trees = buildHierarchy(m.id);
      virtualRoot.children.push(...trees);
    }
  });

  return virtualRoot;
};

export default { buildTreeHierarchy };