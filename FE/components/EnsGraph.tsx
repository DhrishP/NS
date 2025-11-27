'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">Loading Graph Engine...</div>,
});

interface GraphData {
  nodes: { id: string; val: number; img?: string }[];
  links: { source: string | any; target: string | any }[];
}

interface EnsGraphProps {
  data: GraphData;
  onNodeSelect?: (nodeId: string) => void;
  highlightNode?: string | null;
}

export interface EnsGraphRef {
  zoomToFit: (duration?: number, padding?: number) => void;
  centerAt: (x: number, y: number, duration?: number) => void;
}

const EnsGraph = forwardRef<EnsGraphRef, EnsGraphProps>(({ data, onNodeSelect, highlightNode }, ref) => {
  const router = useRouter();
  const fgRef = useRef<any>(null);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  // Internal Highlight State
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<any>());

  useImperativeHandle(ref, () => ({
    zoomToFit: (duration = 1000, padding = 50) => {
      fgRef.current?.zoomToFit(duration, padding);
    },
    centerAt: (x: number, y: number, duration = 1000) => {
      fgRef.current?.centerAt(x, y, duration);
      fgRef.current?.zoom(4, duration);
    }
  }));

  // Preload images when data changes
  useEffect(() => {
    data.nodes.forEach((node) => {
      if (node.img && !images[node.id]) {
        const img = new Image();
        img.src = node.img;
        img.onload = () => {
          setImages((prev) => ({ ...prev, [node.id]: img }));
        };
      }
    });
  }, [data, images]);

  const handleNodeHover = useCallback((node: any) => {
    if ((!node && !hoverNode) || (node && hoverNode === node.id)) return;

    setHoverNode(node ? node.id : null);

    const newHighlightNodes = new Set<string>();
    const newHighlightLinks = new Set<any>();

    if (node) {
      newHighlightNodes.add(node.id);
      data.links.forEach((link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;

        if (sourceId === node.id) {
          newHighlightNodes.add(targetId);
          newHighlightLinks.add(link);
        } else if (targetId === node.id) {
          newHighlightNodes.add(sourceId);
          newHighlightLinks.add(link);
        }
      });
    }

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  }, [data, hoverNode]);

  const handleNodeClick = useCallback((node: any) => {
    if (node && node.id) {
      if (onNodeSelect) {
        onNodeSelect(node.id);
      } else {
        router.push(`/profile/${node.id}`);
      }
    }
  }, [router, onNodeSelect]);

  const getLinkWidth = useCallback((link: any) => highlightLinks.has(link) ? 3 : 1, [highlightLinks]);
  const getLinkColor = useCallback((link: any) => 
    hoverNode 
        ? (highlightLinks.has(link) ? '#3b82f6' : 'rgba(200,200,200,0.1)') 
        : '#cbd5e1'
  , [hoverNode, highlightLinks]);

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-white shadow-inner relative cursor-move">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeLabel="id"
        nodeRelSize={15}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        
        linkWidth={getLinkWidth}
        linkColor={getLinkColor}

        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
        }}
        onLinkClick={(link) => console.log('EnsGraph: Link Clicked', link)}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const isHovered = hoverNode ? highlightNodes.has(node.id) : true;
          const alpha = isHovered ? 1 : 0.1; // Dim others
          
          ctx.save();
          ctx.globalAlpha = alpha;

          const size = 12;
          const img = images[node.id];
          
          // Draw Circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          ctx.fillStyle = '#fff';
          ctx.fill();
          
          // Selection Highlight (External or Hover)
          if (node.id === highlightNode) {
             ctx.lineWidth = 4; 
             ctx.strokeStyle = '#f59e0b'; // Amber (Connect Mode)
             ctx.globalAlpha = 1; // Always show selected
          } else if (hoverNode && node.id === hoverNode) {
             ctx.lineWidth = 4;
             ctx.strokeStyle = '#3b82f6'; // Blue (Hover)
          } else {
             ctx.lineWidth = 2;
             ctx.strokeStyle = '#3b82f6'; // Blue
          }
          ctx.stroke();

          // Draw Image (Avatar) or Text
          if (img && img.complete && img.naturalHeight !== 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, node.y, size - 1, 0, 2 * Math.PI, false);
            ctx.clip();
            ctx.drawImage(img, node.x - size + 1, node.y - size + 1, (size - 1) * 2, (size - 1) * 2);
            ctx.restore();
          } else {
            // Placeholder Initials
            const label = node.id.slice(0, 2).toUpperCase();
            ctx.font = `${size}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#3b82f6'; 
            ctx.fillText(label, node.x, node.y);
          }

          // Draw Label below (only if hovered or zoomed in or no hover active)
          if (isHovered || globalScale > 2) {
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000';
            ctx.fillText(node.id, node.x, node.y + size + 2);
          }
          
          ctx.restore();
        }}
      />
    </div>
  );
});

EnsGraph.displayName = 'EnsGraph';
export default EnsGraph;
