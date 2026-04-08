/**
 * Folder Tree Component
 * Displays family members in a traditional folder/file explorer style
 * with collapsible nodes and expand/collapse functionality
 */

import React, { useState, useMemo } from 'react';
import { Member } from '../../types';
import { 
  ChevronRight, 
  ChevronDown, 
  User, 
  Users, 
  Crown,
  Heart,
  Search,
  FolderOpen,
  Folder,
  Venus,
  Mars,
  PersonStanding
} from 'lucide-react';
import { calculateAge, formatDate } from '../../lib/utils';

interface FolderTreeProps {
  members: Member[];
  onSelectMember?: (member: Member) => void;
  onAddMember?: () => void;
}

interface TreeNode {
  id: string;
  member: Member | null;
  name: string;
  type: 'root' | 'member' | 'spouse';
  children: TreeNode[];
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
}

/**
 * Recursive tree node component
 */
const TreeNodeItem = ({ 
  node, 
  onSelect, 
  onToggle,
  selectedId,
  key
 }: { 
  node: TreeNode; 
  onSelect: (member: Member) => void;
  onToggle: (id: string) => void;
  selectedId?: string;
  key?: string;
}) => {
  const isSelected = selectedId === node.id;
  const member = node.member;
  
  // Get gender icon/color
  const getGenderIcon = () => {
    if (!member) return <Users className="w-4 h-4 text-purple-500" />;
    switch (member.gender) {
      case 'male': return <Mars className="w-4 h-4 text-blue-500" />;
      case 'female': return <Venus className="w-4 h-4 text-pink-500" />;
      default: return <PersonStanding className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get avatar background
  const getAvatarBg = () => {
    if (!member) return 'bg-purple-100';
    switch (member.gender) {
      case 'male': return 'bg-blue-100';
      case 'female': return 'bg-pink-100';
      default: return 'bg-gray-100';
    }
  };

  // Get initials
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="select-none">
      {/* Node row */}
      <div 
        className={`
          flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-150
          ${isSelected 
            ? 'bg-purple-100 border border-purple-300' 
            : 'hover:bg-slate-100 border border-transparent'
          }
        `}
        style={{ paddingLeft: `${node.level * 16 + 8}px` }}
        onClick={() => member && onSelect(member)}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (node.hasChildren) onToggle(node.id);
          }}
          className={`
            w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 transition-colors
            ${!node.hasChildren && 'invisible'}
          `}
        >
          {node.isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Icon */}
        {node.hasChildren ? (
          node.isExpanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500" />
          ) : (
            <Folder className="w-4 h-4 text-amber-400" />
          )
        ) : (
          <div className={`w-8 h-8 rounded-full ${getAvatarBg()} flex items-center justify-center`}>
            {getGenderIcon()}
          </div>
        )}

        {/* Name and info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm truncate ${isSelected ? 'text-purple-700' : 'text-slate-700'}`}>
              {node.name}
            </span>
            {node.type === 'root' && (
              <Crown className="w-3 h-3 text-amber-500" />
            )}
            {member?.spouseId && node.level === 0 && (
              <Heart className="w-3 h-3 text-red-400" />
            )}
          </div>
          {member && (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              {member.birthDate && (
                <span>{formatDate(member.birthDate)}</span>
              )}
              {member.birthDate && (
                <span className="text-slate-300">•</span>
              )}
              {member.birthDate && (
                <span>{calculateAge(member.birthDate, member.deathDate)} tahun</span>
              )}
              {member.deathDate && (
                <span className="text-red-400">✝ {formatDate(member.deathDate)}</span>
              )}
            </div>
          )}
        </div>

        {/* Generation badge */}
        {member && (
          <div className={`
            px-2 py-0.5 rounded-full text-[10px] font-medium
            ${member.gender === 'male' 
              ? 'bg-blue-50 text-blue-600' 
              : member.gender === 'female' 
                ? 'bg-pink-50 text-pink-600'
                : 'bg-gray-50 text-gray-600'
            }
          `}>
            {member.gender === 'male' ? 'L' : member.gender === 'female' ? 'P' : '-'}
          </div>
        )}
      </div>

      {/* Children (if expanded) */}
      {node.isExpanded && node.children.length > 0 && (
        <div>
          {node.children.map(child => (
            <TreeNodeItem
              node={child}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Main FolderTree component
 */
export default function FolderTree({ 
  members, 
  onSelectMember,
  onAddMember 
}: FolderTreeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [selectedId, setSelectedId] = useState<string>();

  // Build tree structure
  const tree = useMemo(() => {
    if (!members.length) return null;

    const memberMap = new Map<string, Member>();
    members.forEach(m => memberMap.set(m.id, m));

    // Find root members (no parents in the current family)
    const memberIds = new Set(members.map(m => m.id));
    const roots = members.filter(m => 
      (!m.fatherId || !memberIds.has(m.fatherId)) && 
      (!m.motherId || !memberIds.has(m.motherId))
    );

    // Build tree recursively
    const buildNode = (member: Member | null, id: string, level: number): TreeNode => {
      let children: TreeNode[] = [];

      if (member) {
        // Find children
        const childMembers = members.filter(m => 
          m.fatherId === id || m.motherId === id
        );
        children = childMembers.map(child => buildNode(child, child.id, level + 1));
      } else {
        // Root level - find all root members
        children = roots.map(root => buildNode(root, root.id, level + 1));
      }

      const hasChildren = children.length > 0;
      const isExpanded = expandedNodes.has(id);

      return {
        id,
        member,
        name: member?.name || 'Keluarga',
        type: member ? 'member' : 'root',
        children,
        level,
        isExpanded,
        hasChildren
      };
    };

    return buildNode(null, 'root', 0);
  }, [members, expandedNodes]);

  // Toggle expand/collapse
  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Handle member selection
  const handleSelect = (member: Member) => {
    setSelectedId(member.id);
    onSelectMember?.(member);
  };

  // Filter by search
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    const term = searchTerm.toLowerCase();
    return members.filter(m => 
      m.name.toLowerCase().includes(term)
    );
  }, [members, searchTerm]);

  // Expand all / Collapse all
  const expandAll = () => {
    const allIds = new Set<string>();
    const addIds = (node: TreeNode) => {
      allIds.add(node.id);
      node.children.forEach(addIds);
    };
    if (tree) addIds(tree);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set(['root']));
  };

  if (!members.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Users className="w-12 h-12 mb-4 text-slate-300" />
        <p className="text-sm">Belum ada anggota keluarga</p>
        <p className="text-xs mt-1">Tambahkan anggota keluarga pertama</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-amber-500" />
          <span className="font-semibold text-slate-700">Struktur Keluarga</span>
          <span className="text-xs text-slate-400">({members.length} anggota)</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={expandAll}
            className="text-xs px-2 py-1 rounded hover:bg-slate-100 text-slate-500"
          >
            Expand All
          </button>
          <button 
            onClick={collapseAll}
            className="text-xs px-2 py-1 rounded hover:bg-slate-100 text-slate-500"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari anggota keluarga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>

      {/* Tree content */}
      <div className="flex-1 overflow-auto p-2">
        {tree && tree.children.map(child => (
          <TreeNodeItem
            node={child}
            onSelect={handleSelect}
            onToggle={toggleNode}
            selectedId={selectedId}
          />
        ))}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Mars className="w-3 h-3 text-blue-500" />
            <span>{members.filter(m => m.gender === 'male').length} Laki-laki</span>
          </div>
          <div className="flex items-center gap-1">
            <Venus className="w-3 h-3 text-pink-500" />
            <span>{members.filter(m => m.gender === 'female').length} Perempuan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
