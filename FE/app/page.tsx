'use client';

import { useState } from 'react';
import EnsGraph from '@/components/EnsGraph';
import { Sheet } from '@/components/ui/Sheet';
import ProfileDetails from '@/components/ProfileDetails';
import { Plus, Link as LinkIcon, MousePointer2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
export default function GraphPage() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedProfile, setSearchedProfile] = useState<string | null>(null);
  
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
    <main className="flex h-screen flex-col bg-gray-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white font-bold text-lg">
            E
          </div>
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">ENS Graph</h1>
        </div>
        
        {/* Editor Toolbar */}
        <div className="flex items-center gap-3">
            {/* Add Node Form */}
            <form onSubmit={handleAddNode} className="flex items-center gap-2 relative">
              <div className="relative">
                <input 
                  type="text" 
                  value={newNodeName}
                  onChange={e => setNewNodeName(e.target.value)}
                  placeholder="vitalik.eth"
                  className="w-64 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 border-0 ring-1 ring-gray-200 px-4 py-2 text-sm shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={isLoading || !newNodeName}
                className="rounded-lg bg-gray-900 p-2 text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add Node"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {/* Mode Toggle */}
            <div className="flex items-center rounded-lg bg-gray-100 p-1 ring-1 ring-gray-200">
              <button
                onClick={() => {
                  setIsConnectMode(false);
                  setConnectSource(null);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  !isConnectMode 
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
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
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  isConnectMode 
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                )}
              >
                <LinkIcon className="h-4 w-4" />
                Connect
              </button>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300"
            >
              <Search className="h-4 w-4" />
              Profiles
            </button>
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

      {/* Search Sheet */}
      <Sheet
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchedProfile(null);
          setSearchQuery('');
        }}
        title="Search Profiles"
      >
        <div className="space-y-6">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                const name = searchQuery.trim().toLowerCase().endsWith('.eth') 
                  ? searchQuery.trim() 
                  : `${searchQuery.trim()}.eth`;
                setSearchedProfile(name);
              }
            }}
            className="flex gap-2"
          >
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="vitalik.eth"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 placeholder:text-gray-400"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={!searchQuery}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              Search
            </button>
          </form>

          {searchedProfile && (
            <div className="border-t pt-6">
              <ProfileDetails ensName={searchedProfile} />
            </div>
          )}
        </div>
      </Sheet>
    </main>
  );
}
