import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Member } from '../../domain/entities';
import { ZoomControls } from './ZoomControls';
import { getLayoutConfig, getScaleConstraints } from './treeLayout';
import { buildTreeHierarchy } from './treeBuilder';
import { renderMemberCard } from './treeRenderer';
import { renderTreeBackground } from './TreeBackground';
import { renderConnections } from './TreeConnections';
import { ZoomIn, ZoomOut, Maximize, MousePointer2, Eye, EyeOff } from 'lucide-react';

interface FamilyTreeProps {
  members: Member[];
  searchTerm?: string;
  onSelectMember: (member: Member) => void;
  onAddRelative?: (member: Member) => void;
  onFamilySelect?: (familyId: string) => void;
  isHeaderHidden?: boolean;
  onToggleHeader?: () => void;
  treePov?: 'suami' | 'istri';
}

export default function FamilyTree({ 
  members, 
  searchTerm = "", 
  onSelectMember, 
  onAddRelative,
  onFamilySelect,
  isHeaderHidden = false,
  onToggleHeader,
  treePov = 'suami'
}: FamilyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isRendering, setIsRendering] = useState(false);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(-1);
  const memberPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Loading state for large trees
  const isLargeTree = members.length > 100;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't navigate if modal is open or user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (document.querySelector('[class*="fixed"][class*="z-"]')) return;
      if (!svgRef.current) return;
      
      const nodes = members;
      let newIndex = selectedNodeIndex;
      
      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          newIndex = Math.min(selectedNodeIndex + 1, nodes.length - 1);
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          newIndex = Math.max(selectedNodeIndex - 1, 0);
          break;
        case 'Enter':
        case 'o':
          e.preventDefault();
          if (selectedNodeIndex >= 0 && selectedNodeIndex < nodes.length) {
            onSelectMember(nodes[selectedNodeIndex]);
          }
          break;
        case 'Escape':
          setSelectedNodeIndex(-1);
          break;
      }
      
      if (newIndex !== selectedNodeIndex) {
        setSelectedNodeIndex(newIndex);
        
        // Auto-pan to selected node
        if (newIndex >= 0 && members[newIndex] && svgRef.current && zoomRef.current) {
          const memberId = members[newIndex].id;
          const pos = memberPositionsRef.current.get(memberId);
          if (pos) {
            const svg = d3.select(svgRef.current);
            const containerWidth = containerRef.current?.clientWidth || 800;
            const containerHeight = containerRef.current?.clientHeight || 600;
            
            // Calculate target position to center the node
            const targetX = containerWidth / 2 - pos.x * zoomLevel;
            const targetY = containerHeight / 2 - pos.y * zoomLevel;
            
            svg.transition()
              .duration(300)
              .call(
                zoomRef.current.transform,
                d3.zoomIdentity.translate(targetX, targetY).scale(zoomLevel)
              );
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [members, selectedNodeIndex, onSelectMember]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || members.length === 0 || dimensions.width === 0) return;

    // Set rendering state for large trees
    if (isLargeTree) {
      setIsRendering(true);
    }

    // Clear previous SVG content
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    const { width, height } = dimensions;
    const isMobile = width < 768;
    
    const nodeWidth = isMobile ? 140 : 200;
    const nodeHeight = isMobile ? 70 : 90;
    const horizontalSpacing = isMobile ? 40 : 80;
    const verticalSpacing = isMobile ? 100 : 140;

    const svg = svgElement
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");

    // Add Grid Background (Subtle)
    const gridSize = 40;
    const gridLimit = 5000;
    const gridGroup = g.append("g").attr("class", "grid-bg");
    
    for (let i = -gridLimit; i <= gridLimit; i += gridSize) {
      gridGroup.append("line")
        .attr("x1", i).attr("y1", -gridLimit)
        .attr("x2", i).attr("y2", gridLimit)
        .attr("stroke", "#f1f5f9").attr("stroke-width", 1);
      gridGroup.append("line")
        .attr("x1", -gridLimit).attr("y1", i)
        .attr("x2", gridLimit).attr("y2", i)
        .attr("stroke", "#f1f5f9").attr("stroke-width", 1);
    }

    // Add Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.02, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // 1. Pre-process data to build a hierarchy of "Units" (Individuals or Couples)
    const memberMap = new Map(members.map(m => [m.id, m]));
    const coveredMembers = new Set<string>();
    
    const buildHierarchy = (memberId: string, parentPath: string = "root", visited: Set<string> = new Set()): any[] => {
      // Prevent infinite recursion
      if (visited.has(memberId)) return [];
      
      const member = memberMap.get(memberId);
      if (!member) return [];

      const newVisited = new Set(visited);
      newVisited.add(memberId);
      
      // Get all spouses (current and past)
      const spouseIds = new Set<string>();
      if (member.spouseId) spouseIds.add(member.spouseId);
      if (member.spouseIds) member.spouseIds.forEach(id => spouseIds.add(id));
      
      // Find all children of this member
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

      const nodes: any[] = [];

      // Create a node for each spouse relationship that has children or is the current spouse
      spouseIds.forEach(spouseId => {
        if (!memberMap.has(spouseId)) return;
        const spouse = memberMap.get(spouseId)!;
        const coupleChildren = childrenByOtherParent.get(spouseId) || [];
        
        // Only create a couple node if they have children together OR it's the primary spouse
        if (coupleChildren.length > 0 || member.spouseId === spouseId) {
          const node: any = {
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

      // If no couple nodes were created, or there are children with no other parent, create an individual node
      if (nodes.length === 0 || childrenWithNoOtherParent.length > 0) {
        const node: any = {
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

    // Create a virtual root
    const virtualRoot: any = {
      id: 'VIRTUAL_ROOT',
      name: 'Root',
      isVirtual: true,
      children: []
    };

    // Find roots (people without parents in the list)
    const roots = members.filter(m => 
      (!m.fatherId || !memberMap.has(m.fatherId)) && 
      (!m.motherId || !memberMap.has(m.motherId))
    );

    const startRoots = roots.length > 0 ? roots : (members.length > 0 ? [members[0]] : []);
    
    // Track which members we've already added to the tree
    const processedRoots = new Set<string>();
    
    startRoots.forEach(r => {
      if (!processedRoots.has(r.id)) {
        const trees = buildHierarchy(r.id);
        virtualRoot.children.push(...trees);
        // Mark all members in these trees as processed
        trees.forEach(tree => markMembersProcessed(tree, processedRoots));
      }
    });

    // Catch any disconnected members
    members.forEach(m => {
      if (!processedRoots.has(m.id)) {
        const trees = buildHierarchy(m.id);
        virtualRoot.children.push(...trees);
        trees.forEach(tree => markMembersProcessed(tree, processedRoots));
      }
    });

    // Helper function to mark all members in a tree as processed
    function markMembersProcessed(node: any, processedSet: Set<string>) {
      if (node.member?.id) processedSet.add(node.member.id);
      if (node.spouse?.id) processedSet.add(node.spouse.id);
      if (node.children) {
        node.children.forEach((child: any) => markMembersProcessed(child, processedSet));
      }
    }

    const hierarchy = d3.hierarchy(virtualRoot);
    
    // 2. Layout
    // Couple nodes are wider
    const treeLayout = d3.tree()
      .nodeSize([nodeWidth * 2 + horizontalSpacing, nodeHeight + verticalSpacing]);
    
    treeLayout(hierarchy);

    // 3. Rendering
    const nodes = hierarchy.descendants().filter(d => !d.data.isVirtual);
    const links = hierarchy.links().filter(l => !l.source.data.isVirtual);

    // Draw Generation Backgrounds & Labels
    const depths = Array.from(new Set(nodes.map(d => d.depth)));
    depths.forEach(depth => {
      const nodesAtDepth = nodes.filter(d => d.depth === depth);
      if (nodesAtDepth.length === 0) return;
      
      const y = nodesAtDepth[0].y;
      const genBg = g.insert("rect", ":first-child")
        .attr("x", -gridLimit)
        .attr("y", y - nodeHeight/2 - 30)
        .attr("width", gridLimit * 2)
        .attr("height", nodeHeight + 60)
        .attr("fill", depth % 2 === 0 ? "#f8fafc" : "transparent")
        .attr("opacity", 0.5)
        .attr("rx", 20);

      g.append("text")
        .attr("x", Math.min(...nodesAtDepth.map(n => n.x)) - 200)
        .attr("y", y)
        .attr("dy", "0.35em")
        .attr("class", "text-[10px] font-black uppercase tracking-[0.2em] fill-slate-300")
        .attr("text-anchor", "end")
        .text(`GEN ${depth}`);
    });

    // Draw Links (Curved/Organic)
    const linkGenerator = d3.linkVertical()
      .x((d: any) => d.x)
      .y((d: any) => d.y);

    g.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", (d: any) => d.target.data.type === 'couple' ? "0" : "4,4")
      .attr("d", (d: any) => {
        const sourceX = d.source.x;
        const sourceY = d.source.y + nodeHeight / 2;
        const targetX = d.target.x;
        const targetY = d.target.y - nodeHeight / 2;
        
        // Custom curved path for cleaner look
        const midY = (sourceY + targetY) / 2;
        return `M${sourceX},${sourceY} 
                C${sourceX},${midY} ${targetX},${midY} ${targetX},${targetY}`;
      })
      .style("transition", "stroke 0.3s ease")
      .on("mouseenter", function() { d3.select(this).attr("stroke", "#3b82f6").attr("stroke-width", 3); })
      .on("mouseleave", function() { d3.select(this).attr("stroke", "#e2e8f0").attr("stroke-width", 2); });

    // Draw Nodes
    const nodeEnter = g.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => {
        // Store position for keyboard navigation
        if (d.data.member?.id) {
          memberPositionsRef.current.set(d.data.member.id, { x: d.x, y: d.y });
        }
        return `translate(${d.x},${d.y})`;
      });

    // Draw Family Unit Backgrounds (Subtle)
    const familyUnits = nodes.filter(d => d.children && d.children.length > 0);
    g.selectAll(".family-unit-bg")
      .data(familyUnits)
      .enter()
      .insert("rect", ":first-child")
      .attr("x", (d: any) => {
        const childX = d.children.map((c: any) => c.x);
        const minX = Math.min(d.x, ...childX) - (d.data.type === 'couple' ? nodeWidth : nodeWidth/2) - 15;
        return minX;
      })
      .attr("y", (d: any) => d.y - nodeHeight/2 - 15)
      .attr("width", (d: any) => {
        const childX = d.children.map((c: any) => c.x);
        const minX = Math.min(d.x, ...childX) - (d.data.type === 'couple' ? nodeWidth : nodeWidth/2) - 15;
        const maxX = Math.max(d.x, ...childX) + (d.data.type === 'couple' ? nodeWidth : nodeWidth/2) + 15;
        return maxX - minX;
      })
      .attr("height", (d: any) => {
        const maxY = Math.max(...d.children.map((c: any) => c.y)) + nodeHeight/2 + 15;
        return maxY - (d.y - nodeHeight/2 - 15);
      })
      .attr("rx", 20)
      .attr("fill", "rgba(241, 245, 249, 0.3)")
      .attr("stroke", "rgba(203, 213, 225, 0.2)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4");

    const renderMemberCard = (parent: any, member: Member, offsetX: number) => {
      const card = parent.append("g")
        .attr("transform", `translate(${offsetX}, 0)`)
        .style("cursor", "pointer")
        .on("click", (event: any) => {
          event.stopPropagation();
          onSelectMember(member);
        });

      const isMatch = searchTerm && member.name.toLowerCase().includes(searchTerm.toLowerCase());
      const accentColor = member.gender === 'male' ? "#3b82f6" : member.gender === 'female' ? "#ec4899" : "#94a3b8";
      const bgColor = member.gender === 'male' ? "#eff6ff" : member.gender === 'female' ? "#fdf2f8" : "#f8fafc";
      
      // Check if member is mantu (adopted or has external family)
      const isMantu = member.isAdoptedChild || !!member.externalFamilyId || !!member.externalSpouseName;
      const mantuColor = "#f59e0b"; // Amber-500 for mantu indicator

      // Card Shadow & Main Background
      card.append("rect")
        .attr("x", -nodeWidth / 2)
        .attr("y", -nodeHeight / 2)
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("rx", isMobile ? 12 : 16)
        .attr("fill", isMantu ? "#fffbeb" : "white") // Amber-50 background for mantu
        .attr("stroke", isMatch ? "#3b82f6" : isMantu ? "#f59e0b" : "#f1f5f9") // Amber border for mantu
        .attr("stroke-width", isMatch ? 3 : isMantu ? 2 : 1)
        .style("filter", "drop-shadow(0 10px 15px -3px rgb(0 0 0 / 0.05))");

      // Mantu Badge
      if (isMantu) {
        card.append("circle")
          .attr("cx", nodeWidth / 2 - 12)
          .attr("cy", -nodeHeight / 2 + 12)
          .attr("r", 10)
          .attr("fill", "#f59e0b");
        
        card.append("text")
          .attr("x", nodeWidth / 2 - 12)
          .attr("y", -nodeHeight / 2 + 12)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text("M");
      }

      // Top Accent Bar (Rounded)
      card.append("path")
        .attr("d", `M${-nodeWidth/2 + 12},${-nodeHeight/2} h${nodeWidth - 24} a4,4 0 0 1 4,4 v2 h${-nodeWidth} v-2 a4,4 0 0 1 4,-4`)
        .attr("fill", accentColor)
        .attr("opacity", 0.8);

      // Avatar Section
      const avatarSize = isMobile ? 40 : 52;
      const avatarX = -nodeWidth / 2 + (isMobile ? 28 : 35);
      const avatarY = 0;

      // Avatar Background/Border
      card.append("circle")
        .attr("cx", avatarX)
        .attr("cy", avatarY)
        .attr("r", avatarSize / 2 + 2)
        .attr("fill", "white")
        .attr("stroke", bgColor)
        .attr("stroke-width", 2);

      if (member.photoUrl) {
        const clipId = `clip-${member.id.replace(/[^a-zA-Z0-9]/g, '')}`;
        card.append("defs")
          .append("clipPath")
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

      // Content Section
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

      // Name
      nameLines.forEach((line, i) => {
        card.append("text")
          .attr("x", textX)
          .attr("y", (isMobile ? -10 : -14) + (i * (isMobile ? 12 : 14)))
          .attr("class", `${isMobile ? (isLongName ? 'text-[10px]' : 'text-[12px]') : (isLongName ? 'text-[12px]' : 'text-sm')} font-black fill-slate-900`)
          .text(line.length > 22 ? line.substring(0, 20) + "..." : line);
      });

      const yOffset = nameLines.length > 1 ? (isMobile ? 10 : 12) : 0;

      // Mantu label
      if (isMantu) {
        card.append("text")
          .attr("x", textX)
          .attr("y", (isMobile ? 8 : 10) + yOffset)
          .attr("class", `${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium fill-amber-600`)
          .text("(Mantu)");
      } else {
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
      }

      // Search Highlight - Add glow effect if matches search
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

      // Status Tag (Bottom)
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

      // Quick Add Button (Floating)
      if (onAddRelative) {
        const addBtn = card.append("g")
          .attr("transform", `translate(${nodeWidth/2 - 14}, ${-nodeHeight/2 + 14})`)
          .attr("class", "quick-add-btn")
          .style("opacity", isMobile ? 1 : 0)
          .on("click", (event: any) => {
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
          .attr("d", "M-4,0 h8 M0,-4 v8")
          .attr("stroke", accentColor)
          .attr("stroke-width", 2)
          .attr("stroke-linecap", "round");

        if (!isMobile) {
          card.on("mouseenter", function() {
            d3.select(this).select(".quick-add-btn").transition().duration(200).style("opacity", 1);
          }).on("mouseleave", function() {
            d3.select(this).select(".quick-add-btn").transition().duration(200).style("opacity", 0);
          });
        }
      }

      // External Spouse Info (Subtle)
      if (member.externalSpouseName) {
        card.append("text")
          .attr("x", textX)
          .attr("y", (isMobile ? 36 : 44) + yOffset)
          .attr("class", "text-[8px] fill-slate-400 italic font-medium")
          .text(`💍 ${member.externalSpouseName}`);
      }
    };

    nodeEnter.each(function(d: any) {
      const gNode = d3.select(this);
      if (d.data.type === 'couple') {
        // Determine left/right positions based on POV (perspective)
        // 'suami' = husband on left, 'istri' = wife on left
        const member = d.data.member;
        const spouse = d.data.spouse;
        
        let leftMember = member;
        let rightMember = spouse;
        
        // Swap based on POV
        if (localTreePov === 'istri') {
          // Wife on left, husband on right
          if (member.gender === 'male') {
            leftMember = spouse;
            rightMember = member;
          }
        } else {
          // Default: husband on left (suami POV)
          if (member.gender === 'female') {
            leftMember = spouse;
            rightMember = member;
          }
        }
        
        renderMemberCard(gNode, leftMember, -(nodeWidth / 2 + 5));
        renderMemberCard(gNode, rightMember, (nodeWidth / 2 + 5));
        
        // Draw a heart icon between them
        const spouseIconGroup = gNode.append("g")
          .attr("transform", "translate(0, 0)");
          
        spouseIconGroup.append("circle")
          .attr("r", 12)
          .attr("fill", "white")
          .attr("stroke", "#f1f5f9")
          .attr("stroke-width", 1)
          .style("filter", "drop-shadow(0 2px 4px rgb(0 0 0 / 0.05))");
          
        spouseIconGroup.append("path")
          .attr("d", "M0,4 C-2,4 -6,0 -6,-3 C-6,-5 -4.5,-6.5 -3,-6.5 C-1.5,-6.5 0,-4.5 0,-4.5 C0,-4.5 1.5,-6.5 3,-6.5 C4.5,-6.5 6,-5 6,-3 C6,0 2,4 0,4 Z")
          .attr("fill", "#ec4899");
      } else {
        // Render single card
        renderMemberCard(gNode, d.data.member, 0);
      }
    });

    // Initial Zoom to fit
    const bounds = g.node()?.getBBox();
    if (bounds && bounds.width > 0 && bounds.height > 0) {
      const fullWidth = width;
      const fullHeight = height;
      
      // Initial zoom at 70% for better overview
      const initialScale = 0.7;
      
      // Center the tree
      const midX = bounds.x + bounds.width / 2;
      const midY = bounds.y + bounds.height / 2;
      const translate = [fullWidth / 2 - initialScale * midX, fullHeight / 2 - initialScale * midY];

      // Apply transform immediately for better UX
      svg.call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(initialScale));
      setZoomLevel(initialScale);
      setIsRendering(false);
    } else {
      // Fallback: center at 70% zoom if no bounds available
      svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.7));
      setIsRendering(false);
    }

  }, [members, onSelectMember, searchTerm, dimensions, localTreePov]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const g = svg.select("g");
    const bounds = (g.node() as any)?.getBBox();
    
    if (bounds && bounds.width > 0) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const isMobile = width < 768;
      const midX = bounds.x + bounds.width / 2;
      const midY = bounds.y + bounds.height / 2;
      
      let scale = 0.9 / Math.max(bounds.width / width, bounds.height / height);
      
      // Constraints for readability
      if (isMobile) {
        scale = Math.max(0.4, Math.min(scale, 1.2));
      } else {
        scale = Math.max(0.2, Math.min(scale, 1.1));
      }

      const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

      svg.transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }
  };

  // Handler to toggle POV
  const handleTogglePov = () => {
    // This will trigger a re-render with the new POV
    // We use a callback prop to notify parent
    const newPov = treePov === 'suami' ? 'istri' : 'suami';
    // Trigger re-render by using a state update approach
    // Since treePov comes from props, we'll use a different approach
    // Actually, we need to pass a setter or use a local state
    // For now, let's use a simpler approach: force re-render
    setTreePov(newPov as any);
  };

  // Local state for treePov to enable toggling
  const [localTreePov, setTreePov] = useState(treePov);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative">
      {/* Loading State for Large Trees */}
      {isRendering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/90">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-600">Merender silsilah...</span>
          </div>
        </div>
      )}
      
      <svg ref={svgRef} className="w-full h-full family-tree-svg" tabIndex={0} />
      
      {/* POV Toggle Button */}
      <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
        <button
          onClick={handleTogglePov}
          className="bg-white hover:bg-slate-50 px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 transition-colors"
          title={localTreePov === 'suami' ? 'POV: Suami di kiri (klik untuk ganti)' : 'POV: Istri di kiri (klik untuk ganti)'}
        >
          <span className="text-lg">{localTreePov === 'suami' ? '👨' : '👩'}</span>
          <span className="text-xs font-medium text-slate-600">
            {localTreePov === 'suami' ? 'POV Suami' : 'POV Istri'}
          </span>
        </button>
      </div>
      
      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 flex flex-col gap-1">
          <button 
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
            title="Perbesar"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="h-px bg-slate-100 mx-2" />
          <button 
            onClick={handleZoomOut}
            className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
            title="Perkecil"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <div className="h-px bg-slate-100 mx-2" />
          <button 
            onClick={handleResetZoom}
            className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
            title="Fit ke Layar"
          >
            <Maximize className="w-5 h-5" />
          </button>
          {onToggleHeader && (
            <>
              <div className="h-px bg-slate-100 mx-2" />
              <button 
                onClick={onToggleHeader}
                className="p-2.5 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
                title={isHeaderHidden ? "Tampilkan Menu" : "Sembunyikan Menu"}
              >
                {isHeaderHidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-400 text-center">
          {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Interaction Tip */}
      <div className="absolute top-4 left-4 lg:top-6 lg:right-6 lg:left-auto bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 pointer-events-none">
        <MousePointer2 className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[10px] font-medium text-slate-500">Geser & Zoom untuk navigasi</span>
      </div>
    </div>
  );
}
