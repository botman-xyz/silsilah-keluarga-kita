/**
 * Tree Node Renderer
 * Renders individual member cards in the family tree
 */

import * as d3 from 'd3';
import { Member } from '../../domain/entities';

export interface NodeRendererOptions {
  nodeWidth: number;
  nodeHeight: number;
  isMobile: boolean;
  searchTerm: string;
  onSelectMember: (member: Member) => void;
  onAddRelative?: (member: Member) => void;
  isMantu?: boolean;
}

/**
 * Render a member card at the specified offset
 */
export const renderMemberCard = (
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  member: Member,
  offsetX: number,
  options: NodeRendererOptions
): d3.Selection<SVGGElement, unknown, null, undefined> => {
  const { nodeWidth, nodeHeight, isMobile, searchTerm, onSelectMember, onAddRelative, isMantu = false } = options;
  
  const card = parent.append("g")
    .attr("transform", `translate(${offsetX}, 0)`)
    .style("cursor", "pointer")
    .on("click", (event: MouseEvent) => {
      event.stopPropagation();
      onSelectMember(member);
    });

  const isMatch = searchTerm && member.name.toLowerCase().includes(searchTerm.toLowerCase());
  const accentColor = member.gender === 'male' ? "#3b82f6" : member.gender === 'female' ? "#ec4899" : "#94a3b8";
  const bgColor = member.gender === 'male' ? "#eff6ff" : member.gender === 'female' ? "#fdf2f8" : "#f8fafc";

  // Card background
  card.append("rect")
    .attr("x", -nodeWidth / 2)
    .attr("y", -nodeHeight / 2)
    .attr("width", nodeWidth)
    .attr("height", nodeHeight)
    .attr("rx", isMobile ? 12 : 16)
    .attr("fill", isMantu ? "#fffbeb" : "white") // Amber-50 for mantu
    .attr("stroke", isMatch ? "#3b82f6" : isMantu ? "#f59e0b" : "#f1f5f9") // Amber border for mantu
    .attr("stroke-width", isMatch ? 3 : isMantu ? 2 : 1)
    .style("filter", "drop-shadow(0 10px 15px -3px rgb(0 0 0 / 0.05))");

  // Top accent bar
  card.append("path")
    .attr("d", `M${-nodeWidth/2 + 12},${-nodeHeight/2} h${nodeWidth - 24} a4,4 0 0 1 4,4 v2 h${-nodeWidth} v-2 a4,4 0 0 1 4,-4`)
    .attr("fill", accentColor)
    .attr("opacity", 0.8);

  // Avatar
  const avatarSize = isMobile ? 40 : 52;
  const avatarX = -nodeWidth / 2 + (isMobile ? 28 : 35);
  const avatarY = 0;

  card.append("circle")
    .attr("cx", avatarX)
    .attr("cy", avatarY)
    .attr("r", avatarSize / 2 + 2)
    .attr("fill", "white")
    .attr("stroke", bgColor)
    .attr("stroke-width", 2);

  if (member.photoUrl) {
    const clipId = `clip-${member.id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const defs = card.append("defs");
    defs.append("clipPath")
      .attr("id", clipId)
      .append("circle")
      .attr("cx", avatarX)
      .attr("cy", avatarY)
      .attr("r", avatarSize / 2);

    card.append("image")
      .attr("xlink:href", member.photoUrl)
      .attr("crossorigin", "anonymous")
      .attr("x", avatarX - avatarSize / 2)
      .attr("y", avatarY - avatarSize / 2)
      .attr("width", avatarSize)
      .attr("height", avatarSize)
      .attr("clip-path", `url(#${clipId})`)
      .attr("preserveAspectRatio", "xMidYMid slice");
  } else {
    card.append("circle")
      .attr("cx", avatarX)
      .attr("cy", avatarY)
      .attr("r", avatarSize / 2)
      .attr("fill", bgColor);

    card.append("text")
      .attr("x", avatarX)
      .attr("y", avatarY)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("class", `${isMobile ? 'text-[14px]' : 'text-base'} font-black`)
      .attr("fill", accentColor)
      .text(member.name.charAt(0).toUpperCase());
  }

  // Name and details
  const textX = -nodeWidth / 2 + (isMobile ? 58 : 75);
  const name = member.name;
  const maxChars = isMobile ? 12 : 18;
  const isLongName = name.length > maxChars;
  
  let nameLines = [name];
  if (isLongName) {
    const words = name.split(' ');
    if (words.length > 1) {
      let line1 = "";
      let i = 0;
      while (i < words.length && (line1 + words[i]).length <= maxChars) {
        line1 += (line1 ? " " : "") + words[i];
        i++;
      }
      const line2 = words.slice(i).join(' ');
      if (line1 && line2) nameLines = [line1, line2];
    }
  }

  nameLines.forEach((line, i) => {
    card.append("text")
      .attr("x", textX)
      .attr("y", (isMobile ? -10 : -14) + (i * (isMobile ? 12 : 14)))
      .attr("class", `${isMobile ? (isLongName ? 'text-[10px]' : 'text-[12px]') : (isLongName ? 'text-[12px]' : 'text-sm')} font-black fill-slate-900`)
      .text(line.length > 22 ? line.substring(0, 20) + "..." : line);
  });

  const yOffset = nameLines.length > 1 ? (isMobile ? 10 : 12) : 0;

  // Dates
  card.append("text")
    .attr("x", textX)
    .attr("y", (isMobile ? 8 : 10) + yOffset)
    .attr("class", `${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium fill-slate-500`)
    .text(() => {
      const birth = member.birthDate ? new Date(member.birthDate).getFullYear() : "?";
      const death = member.deathDate ? new Date(member.deathDate).getFullYear() : "";
      return `${birth} ${death ? `— ${death}` : ""}`;
    });

  // Search highlight
  if (searchTerm && member.name.toLowerCase().includes(searchTerm.toLowerCase())) {
    card.append("rect")
      .attr("x", -nodeWidth/2 - 4)
      .attr("y", -nodeHeight/2 - 4)
      .attr("width", nodeWidth + 8)
      .attr("height", nodeHeight + 8)
      .attr("rx", 16)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("class", "search-highlight")
      .style("animation", "pulse 2s infinite");
  }

  // Status tag
  const statusTag = card.append("g")
    .attr("transform", `translate(${textX}, ${(isMobile ? 20 : 26) + yOffset})`);

  const statusText = member.maritalStatus === 'divorced' ? "Cerai" : 
                     member.maritalStatus === 'widowed' ? "Wafat" : 
                     member.gender === 'male' ? "Laki-laki" : "Perempuan";
  
  const tagPadding = isMobile ? 6 : 8;
  const tagWidth = statusText.length * (isMobile ? 4.5 : 5.5) + tagPadding * 2;
  
  statusTag.append("rect")
    .attr("width", tagWidth)
    .attr("height", isMobile ? 14 : 16)
    .attr("rx", 6)
    .attr("fill", bgColor)
    .attr("opacity", 0.7);

  statusTag.append("text")
    .attr("x", tagWidth / 2)
    .attr("y", isMobile ? 9 : 11)
    .attr("text-anchor", "middle")
    .attr("class", `${isMobile ? 'text-[8px]' : 'text-[10px]'} font-black uppercase tracking-tight`)
    .attr("fill", accentColor)
    .text(statusText);

  // Quick add button
  if (onAddRelative) {
    const addBtn = card.append("g")
      .attr("transform", `translate(${nodeWidth/2 - 14}, ${-nodeHeight/2 + 14})`)
      .attr("class", "quick-add-btn")
      .style("opacity", isMobile ? 1 : 0)
      .on("click", (event: MouseEvent) => {
        event.stopPropagation();
        onAddRelative(member);
      });

    addBtn.append("circle")
      .attr("r", 10)
      .attr("fill", "white")
      .attr("stroke", "#f1f5f9")
      .attr("stroke-width", 1)
      .style("filter", "drop-shadow(0 2px 4px rgb(0 0 0 / 0.05))");

    addBtn.append("path")
      .attr("d", "M-3 0 h6 M0 -3 v6")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round");
  }

  return card;
};

export default { renderMemberCard };