'use client';

import { useState } from 'react';
import EnsGraph from '@/components/EnsGraph';
import Link from 'next/link';
import { Sheet } from '@/components/ui/Sheet';
import ProfileDetails from '@/components/ProfileDetails';
import { Plus, Link as LinkIcon, MousePointer2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
export default function GraphPage() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  
  // Editor State
  const [newNodeName, setNewNodeName] = useState('');
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initial data load (simulation)
  if (!initialized && graphData.nodes.length === 0) {
     // Note: In a real app, we'd fetch this from the DB. 
     // For now, we start empty or could parse DEFAULT_INPUT if desired.
     // Let's start empty as it's a "Builder".
     // setInitialized(true);
  }

  // Helper to fetch avatar for a new node
  const fetchAvatar = async (name: string) => {
    try {
      const response = await fetch('/api/ens/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: [name] }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.results[0]?.avatar || undefined;
      }
    } catch (e) {
      console.error(e);
    }
    return undefined;
  };

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;
    
    const name = newNodeName.trim().toLowerCase().endsWith('.eth') 
      ? newNodeName.trim() 
      : `${newNodeName.trim()}.eth`;

    if (graphData.nodes.some(n => n.id === name)) {
      alert('Node already exists!');
      return;
    }

    setIsLoading(true);
    const avatar = await fetchAvatar(name);
    setIsLoading(false);

    setGraphData(prev => ({
      ...prev,
      nodes: [...prev.nodes, { id: name, val: 1, img: avatar }]
    }));
    setNewNodeName('');
  };

  const handleNodeClick = (nodeId: string) => {
    if (isConnectMode) {
      if (!connectSource) {
        // Select Source
        setConnectSource(nodeId);
      } else {
        // Connect or Disconnect!
        if (connectSource === nodeId) {
          setConnectSource(null); // Deselect self
          return;
        }

        // Robust connection check
        const isConnected = (l: any) => {
            const s = (l.source && typeof l.source === 'object') ? l.source.id : l.source;
            const t = (l.target && typeof l.target === 'object') ? l.target.id : l.target;
            return (s === connectSource && t === nodeId) || (s === nodeId && t === connectSource);
        };

        const exists = graphData.links.some(isConnected);

        if (exists) {
            // Disconnect (Remove Link) - using filter for cleaner update
            setGraphData(prev => ({
                ...prev,
                links: prev.links.filter(l => !isConnected(l))
            }));
        } else {
            // Connect (Add Link)
            setGraphData(prev => ({
                ...prev,
                links: [...prev.links, { source: connectSource, target: nodeId }]
            }));
        }
        setConnectSource(null); // Reset cycle
      }
    } else {
      // View Details
      setSelectedNode(nodeId);
    }
  };

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">ENS Graph</h1>
        </div>
        
        {/* Editor Toolbar */}
        <div className="flex items-center gap-4">
            {/* Add Node Form */}
            <form onSubmit={handleAddNode} className="flex items-center gap-2">
              <input 
                type="text" 
                value={newNodeName}
                onChange={e => setNewNodeName(e.target.value)}
                placeholder="Add vitalik.eth"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={isLoading || !newNodeName}
                className="rounded-md bg-gray-900 p-2 text-white hover:bg-gray-800 disabled:opacity-50"
                title="Add Node"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>

            <div className="h-6 w-px bg-gray-300 mx-2"></div>

            {/* Mode Toggle */}
            <button
              onClick={() => {
                setIsConnectMode(false);
                setConnectSource(null);
              }}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                !isConnectMode ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <MousePointer2 className="h-4 w-4" />
              Inspect
            </button>
            <button
              onClick={() => {
                setIsConnectMode(true);
                setSelectedNode(null); // Close sheet
              }}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isConnectMode ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <LinkIcon className="h-4 w-4" />
              Connect
            </button>

            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            
            <Link 
              href="/profile"
              className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Search className="h-4 w-4" />
              Profiles
            </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Area: Graph */}
        <section className="flex-1 relative bg-gray-100">
          <EnsGraph 
            data={graphData} 
            onNodeSelect={handleNodeClick} 
            highlightNode={connectSource}
          />
          
          {/* Hint Toast */}
          {isConnectMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {connectSource ? `Select target to connect (or disconnect) from ${connectSource}` : 'Select a source node'}
            </div>
          )}

          {graphData.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <p className="text-lg font-medium">Canvas is empty</p>
              <p className="text-sm">Add an ENS name above to start building.</p>
            </div>
          )}
        </section>
      </div>

      <Sheet 
        isOpen={!!selectedNode} 
        onClose={() => setSelectedNode(null)}
        title="ENS Profile"
      >
        {selectedNode && <ProfileDetails ensName={selectedNode} />}
      </Sheet>
    </main>
  );
}
