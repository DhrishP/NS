'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Dynamic import to avoid SSR issues with force-graph
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500">Loading Graph Engine...</div>,
});

interface GraphData {
  nodes: { id: string; val: number; img?: string }[];
  links: { source: string; target: string }[];
}

interface EnsGraphProps {
  data: GraphData;
  onNodeSelect?: (nodeId: string) => void;
  highlightNode?: string | null;
}

export default function EnsGraph({ data, onNodeSelect, highlightNode }: EnsGraphProps) {
  const router = useRouter();
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    console.log('EnsGraph received data:', data);
  }, [data]);

  // Preload images when data changes
  useEffect(() => {
    data.nodes.forEach((node) => {
      if (node.img) {
        const img = new Image();
        img.src = node.img;
        img.onload = () => {
          setImages((prev) => ({ ...prev, [node.id]: img }));
        };
      }
    });
  }, [data]);

  const handleNodeClick = useCallback((node: any) => {
    console.log('EnsGraph: Raw Node Click', node);
    if (node && node.id) {
      if (onNodeSelect) {
        onNodeSelect(node.id);
      } else {
        router.push(`/profile/${node.id}`);
      }
    }
  }, [router, onNodeSelect]);

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-white shadow-inner">
      <ForceGraph2D
        graphData={data}
        nodeLabel="id"
        nodeRelSize={15} // Hit radius = 15px (larger than visual 12px)
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkWidth={2}
        onNodeDragEnd={(node) => {
          // Pin node on drag end
          node.fx = node.x;
          node.fy = node.y;
        }}
        onLinkClick={(link) => console.log('EnsGraph: Link Clicked', link)}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          ctx.save(); // Start isolated context
          const size = 12;
          const img = images[node.id];
          
          // Draw Circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
          ctx.fillStyle = '#fff';
          ctx.fill();
          
          // Selection Highlight
          if (node.id === highlightNode) {
             ctx.lineWidth = 6; // Much thicker border
             ctx.strokeStyle = '#f59e0b'; // Amber
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
            ctx.fillStyle = '#3b82f6'; // blue-500
            ctx.fillText(label, node.x, node.y);
          }

          // Draw Label below
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#000';
          ctx.fillText(node.id, node.x, node.y + size + 2);
          
          ctx.restore(); // Restore context to prevent pollution
        }}
      />
    </div>
  );
}

