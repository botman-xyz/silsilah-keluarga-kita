/**
 * Family Member Node Component
 * Custom ReactFlow node for individual family members
 */

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Member } from '../../../domain/entities';
import { User, Plus, Calendar, MapPin } from 'lucide-react';

interface FamilyMemberNodeData {
  member: Member;
  onSelectMember: (member: Member) => void;
  onAddRelative?: (member: Member) => void;
  searchTerm?: string;
}

interface FamilyMemberNodeProps {
  data: FamilyMemberNodeData;
}

export const FamilyMemberNode: React.FC<FamilyMemberNodeProps> = memo(({ data }) => {
  const { member, onSelectMember, onAddRelative, searchTerm } = data;

  if (!member) return null;

  const isMatch = searchTerm && member.name.toLowerCase().includes(searchTerm.toLowerCase());
  const accentColor = member.gender === 'male' ? '#3b82f6' : member.gender === 'female' ? '#ec4899' : '#94a3b8';
  const bgColor = member.gender === 'male' ? '#eff6ff' : member.gender === 'female' ? '#fdf2f8' : '#f8fafc';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectMember(member);
  };

  const handleAddRelative = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddRelative?.(member);
  };

  return (
    <div
      className="relative group"
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: accentColor, width: 8, height: 8 }}
      />

      {/* Node card */}
      <div
        className="relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105"
        style={{
          width: 180,
          minHeight: 100,
          borderColor: isMatch ? '#3b82f6' : '#f1f5f9',
          backgroundColor: bgColor,
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
          style={{ backgroundColor: accentColor, opacity: 0.8 }}
        />

        {/* Content */}
        <div className="pt-4 px-4 pb-4">
          {/* Avatar */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: accentColor, opacity: 0.2 }}
            >
              <User className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-800 text-sm truncate">
                {member.name}
              </h3>
              {member.birthDate && (
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <p className="text-xs text-slate-500 truncate">
                    {member.birthDate}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional info */}
          {member.gender && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: accentColor,
                  opacity: 0.2,
                  color: accentColor,
                }}
              >
                {member.gender === 'male' ? 'Laki-laki' : member.gender === 'female' ? 'Perempuan' : 'Lainnya'}
              </span>
            </div>
          )}

          {/* Location if available */}
          {(member as any).address && (
            <div className="flex items-center gap-1 mt-2">
              <MapPin className="w-3 h-3 text-slate-400" />
              <p className="text-xs text-slate-500 truncate">
                {(member as any).address}
              </p>
            </div>
          )}
        </div>

        {/* Add relative button */}
        {onAddRelative && (
          <button
            onClick={handleAddRelative}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md border border-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-50 hover:scale-110"
            title="Tambah kerabat"
          >
            <Plus className="w-4 h-4 text-blue-500" />
          </button>
        )}

        {/* Search highlight */}
        {isMatch && (
          <div
            className="absolute -inset-1 rounded-xl border-3 border-blue-500 animate-pulse"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </div>

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: accentColor, width: 8, height: 8 }}
      />
    </div>
  );
});

FamilyMemberNode.displayName = 'FamilyMemberNode';

export default FamilyMemberNode;
