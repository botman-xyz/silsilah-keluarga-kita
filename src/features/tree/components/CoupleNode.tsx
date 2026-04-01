/**
 * Couple Node Component
 * Custom ReactFlow node for couple (husband and wife)
 */

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Member } from '../../../domain/entities';
import { User, Plus, Heart, Calendar } from 'lucide-react';

interface CoupleNodeData {
  member: Member;
  spouse: Member;
  onSelectMember: (member: Member) => void;
  onAddRelative?: (member: Member) => void;
  searchTerm?: string;
}

interface CoupleNodeProps {
  data: CoupleNodeData;
}

export const CoupleNode: React.FC<CoupleNodeProps> = memo(({ data }) => {
  const { member, spouse, onSelectMember, onAddRelative, searchTerm } = data;

  if (!member || !spouse) return null;

  const isMemberMatch = searchTerm && member.name.toLowerCase().includes(searchTerm.toLowerCase());
  const isSpouseMatch = searchTerm && spouse.name.toLowerCase().includes(searchTerm.toLowerCase());
  const isMatch = isMemberMatch || isSpouseMatch;

  const memberAccentColor = member.gender === 'male' ? '#3b82f6' : member.gender === 'female' ? '#ec4899' : '#94a3b8';
  const spouseAccentColor = spouse.gender === 'male' ? '#3b82f6' : spouse.gender === 'female' ? '#ec4899' : '#94a3b8';

  const handleMemberClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectMember(member);
  };

  const handleSpouseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectMember(spouse);
  };

  const handleAddRelative = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddRelative?.(member);
  };

  return (
    <div className="relative group">
      {/* Target handle (top) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#94a3b8', width: 8, height: 8 }}
      />

      {/* Couple container */}
      <div className="flex items-center gap-2">
        {/* Member card */}
        <div
          className="relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
          onClick={handleMemberClick}
          style={{
            width: 180,
            minHeight: 100,
            borderColor: isMemberMatch ? '#3b82f6' : '#f1f5f9',
            backgroundColor: member.gender === 'male' ? '#eff6ff' : member.gender === 'female' ? '#fdf2f8' : '#f8fafc',
          }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
            style={{ backgroundColor: memberAccentColor, opacity: 0.8 }}
          />

          {/* Content */}
          <div className="pt-4 px-4 pb-4">
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: memberAccentColor, opacity: 0.2 }}
              >
                <User className="w-5 h-5" style={{ color: memberAccentColor }} />
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

            {/* Gender badge */}
            {member.gender && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: memberAccentColor,
                    opacity: 0.2,
                    color: memberAccentColor,
                  }}
                >
                  {member.gender === 'male' ? 'Laki-laki' : member.gender === 'female' ? 'Perempuan' : 'Lainnya'}
                </span>
              </div>
            )}
          </div>

          {/* Search highlight */}
          {isMemberMatch && (
            <div
              className="absolute -inset-1 rounded-xl border-3 border-blue-500 animate-pulse"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </div>

        {/* Heart connection */}
        <div className="flex flex-col items-center animate-pulse">
          <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
        </div>

        {/* Spouse card */}
        <div
          className="relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
          onClick={handleSpouseClick}
          style={{
            width: 180,
            minHeight: 100,
            borderColor: isSpouseMatch ? '#3b82f6' : '#f1f5f9',
            backgroundColor: spouse.gender === 'male' ? '#eff6ff' : spouse.gender === 'female' ? '#fdf2f8' : '#f8fafc',
          }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-2 rounded-t-xl"
            style={{ backgroundColor: spouseAccentColor, opacity: 0.8 }}
          />

          {/* Content */}
          <div className="pt-4 px-4 pb-4">
            {/* Avatar */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: spouseAccentColor, opacity: 0.2 }}
              >
                <User className="w-5 h-5" style={{ color: spouseAccentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 text-sm truncate">
                  {spouse.name}
                </h3>
                {spouse.birthDate && (
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-500 truncate">
                      {spouse.birthDate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Gender badge */}
            {spouse.gender && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: spouseAccentColor,
                    opacity: 0.2,
                    color: spouseAccentColor,
                  }}
                >
                  {spouse.gender === 'male' ? 'Laki-laki' : spouse.gender === 'female' ? 'Perempuan' : 'Lainnya'}
                </span>
              </div>
            )}
          </div>

          {/* Search highlight */}
          {isSpouseMatch && (
            <div
              className="absolute -inset-1 rounded-xl border-3 border-blue-500 animate-pulse"
              style={{ pointerEvents: 'none' }}
            />
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
      </div>

      {/* Source handle (bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#94a3b8', width: 8, height: 8 }}
      />
    </div>
  );
});

CoupleNode.displayName = 'CoupleNode';

export default CoupleNode;
