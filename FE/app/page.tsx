'use client';

import { useState, useEffect, useRef } from 'react';
import EnsGraph, { EnsGraphRef } from '@/components/EnsGraph';
import { Sheet } from '@/components/ui/Sheet';
import ProfileDetails from '@/components/ProfileDetails';
import { Plus, Link as LinkIcon, MousePointer2, Search, Network, Trash2, LayoutDashboard, History, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function GraphPage() {
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedProfile, setSearchedProfile] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const graphRef = useRef<EnsGraphRef>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [newNodeName, setNewNodeName] = useState('');
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

  // Load Graph
  useEffect(() => {
    const loadGraph = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/graph`);
        if (res.ok) {
          const data = await res.json();
          if (data.data && Array.isArray(data.data.nodes)) {
            setGraphData({
              nodes: data.data.nodes,
              links: data.data.links
            });
          }
        }
      } catch (e) {
        console.error('Failed to load graph', e);
        toast.error('Failed to load graph data');
      } finally {
        setInitialized(true);
      }
    };
    loadGraph();
  }, []);

  // Auto-Save
  useEffect(() => {
    if (!initialized) return;
    
    const saveGraph = async () => {
      setIsSaving(true);
      try {
        const cleanData = {
          nodes: graphData.nodes.map(n => ({ id: n.id, val: n.val, img: n.img })),
          links: graphData.links.map(l => ({
            source: typeof l.source === 'object' ? l.source.id : l.source,
            target: typeof l.target === 'object' ? l.target.id : l.target
          }))
        };

        await fetch(`${BACKEND_URL}/api/graph`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanData),
        });
      } catch (e) {
        console.error('Save failed', e);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(saveGraph, 2000); 
    return () => clearTimeout(timer);
  }, [graphData, initialized]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        if (e.key === '/' || (e.key === 'k' && e.metaKey)) {
            e.preventDefault();
            inputRef.current?.focus();
        } else if (e.key.toLowerCase() === 'c') {
            setIsConnectMode(prev => !prev);
            setSelectedNode(null);
        } else if (e.key.toLowerCase() === 'i') {
            setIsConnectMode(false);
            setConnectSource(null);
        } else if (e.key.toLowerCase() === 'p') {
            setIsSearchOpen(true);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helpers
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

  const handleCenterGraph = () => {
    graphRef.current?.zoomToFit(1000, 50);
    toast.success('Graph centered');
  };

  const addNode = async (rawName: string) => {
    if (!rawName.trim()) return;
    const name = rawName.trim().toLowerCase().endsWith('.eth') 
      ? rawName.trim() 
      : `${rawName.trim()}.eth`;

    if (graphData.nodes.some(n => n.id === name)) {
      toast.error('Node already exists!');
      const existing = graphData.nodes.find(n => n.id === name);
      if (existing && typeof existing.x === 'number') {
        graphRef.current?.centerAt(existing.x, existing.y, 1000);
      }
      return;
    }

    setIsLoading(true);
    const avatar = await fetchAvatar(name);
    setIsLoading(false);

    setGraphData(prev => ({
      ...prev,
      nodes: [...prev.nodes, { id: name, val: 1, img: avatar }]
    }));
    toast.success(`Added ${name}`);
  };

  const handleAddNodeForm = (e: React.FormEvent) => {
    e.preventDefault();
    addNode(newNodeName);
    setNewNodeName('');
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    
    setGraphData(prev => ({
      nodes: prev.nodes.filter(n => n.id !== selectedNode),
      links: prev.links.filter(l => {
          const s = typeof l.source === 'object' ? l.source.id : l.source;
          const t = typeof l.target === 'object' ? l.target.id : l.target;
          return s !== selectedNode && t !== selectedNode;
      })
    }));
    setSelectedNode(null);
    setShowDeleteConfirm(false);
    toast.success('Node deleted');
  };

  const handleNodeClick = (nodeId: string) => {
    if (isConnectMode) {
      if (!connectSource) {
        setConnectSource(nodeId);
      } else {
        if (connectSource === nodeId) {
          setConnectSource(null);
          return;
        }
        const isConnected = (l: any) => {
            const s = (l.source && typeof l.source === 'object') ? l.source.id : l.source;
            const t = (l.target && typeof l.target === 'object') ? l.target.id : l.target;
            return (s === connectSource && t === nodeId) || (s === nodeId && t === connectSource);
        };
        const exists = graphData.links.some(isConnected);
        if (exists) {
            setGraphData(prev => ({
                ...prev,
                links: prev.links.filter(l => !isConnected(l))
            }));
        } else {
            setGraphData(prev => ({
                ...prev,
                links: [...prev.links, { source: connectSource, target: nodeId }]
            }));
        }
        setConnectSource(null);
      }
    } else {
      setSelectedNode(nodeId);
      setShowDeleteConfirm(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const name = searchQuery.trim().toLowerCase().endsWith('.eth') 
        ? searchQuery.trim() 
        : `${searchQuery.trim()}.eth`;
      
      const existingNode = graphData.nodes.find(n => n.id === name);
      
      if (existingNode && typeof existingNode.x === 'number') {
          graphRef.current?.centerAt(existingNode.x, existingNode.y, 1000);
          toast.success(`Located ${name}`);
          setIsSearchOpen(false);
          setSearchQuery('');
          return;
      }

      setSearchedProfile(name);
    }
  };

  return (
    <main className="flex h-screen flex-col bg-gray-50 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="ENS Social Graph Logo" className="h-8 w-8" />
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">ENS Social Network</h1>
        </div>
        
        {/* Editor Toolbar */}
        <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400 w-16 text-right transition-opacity duration-300">
              {isSaving ? 'Saving...' : 'Saved'}
            </div>

            {/* Add Node Form */}
            <form onSubmit={handleAddNodeForm} className="flex items-center gap-2 relative">
              <div className="relative">
                <input 
                  ref={inputRef}
                  type="text" 
                  value={newNodeName}
                  onChange={e => setNewNodeName(e.target.value)}
                  placeholder="vitalik.eth (Press /)"
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
                className="rounded-lg bg-gray-900 p-2 text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer group",
                  !isConnectMode 
                    ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                )}
                title="Inspect Mode (I)"
              >
                <MousePointer2 className="h-4 w-4" />
                Inspect
                <kbd className={cn("ml-1 hidden lg:inline-block min-h-[20px] px-1 rounded border text-[10px] font-sans", !isConnectMode ? "bg-gray-100 border-gray-200 text-gray-500" : "bg-white border-gray-200 text-gray-400")}>I</kbd>
              </button>
              <button
                onClick={() => {
                  setIsConnectMode(true);
                  setSelectedNode(null);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer group",
                  isConnectMode 
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                )}
                title="Connect Mode (C)"
              >
                <LinkIcon className="h-4 w-4" />
                Connect
                <kbd className={cn("ml-1 hidden lg:inline-block min-h-[20px] px-1 rounded border text-[10px] font-sans", isConnectMode ? "bg-gray-100 border-gray-200 text-blue-500" : "bg-white border-gray-200 text-gray-400")}>C</kbd>
              </button>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 cursor-pointer group"
              title="Profiles (P)"
            >
              <Search className="h-4 w-4" />
              Profiles
              <kbd className="ml-1 hidden lg:inline-block min-h-[20px] px-1 rounded border bg-white text-[10px] font-sans border-gray-200 text-gray-400">P</kbd>
            </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <section className="flex-1 relative bg-gray-100">
          <EnsGraph 
            ref={graphRef}
            data={graphData} 
            onNodeSelect={handleNodeClick} 
            highlightNode={connectSource}
          />
          
          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
             <button
                onClick={handleCenterGraph}
                className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 hover:shadow-xl text-gray-700 transition-all cursor-pointer"
                title="Center Graph"
             >
                <LayoutDashboard className="h-5 w-5" />
             </button>
          </div>

          {isConnectMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {connectSource ? `Select target to connect (or disconnect) from ${connectSource}` : 'Select a source node'}
            </div>
          )}

          {graphData.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <div className="h-24 w-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
                <Network className="h-10 w-10 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-600">Canvas is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add an ENS name above to start building your network.</p>
            </div>
          )}
        </section>
      </div>

      <Sheet 
        isOpen={!!selectedNode} 
        onClose={() => setSelectedNode(null)}
        title="ENS Profile"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1">
            {selectedNode && <ProfileDetails ensName={selectedNode} />}
          </div>
          
          <div className="border-t pt-6 mt-6">
            {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Node
                </button>
            ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                    <h4 className="text-sm font-medium text-red-800 flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4"/> 
                        Confirm Deletion
                    </h4>
                    <p className="text-xs text-red-600 mb-3 leading-relaxed">
                        Are you sure you want to delete <strong>{selectedNode}</strong>?
                    </p>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDeleteNode} 
                            className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
                        >
                            Confirm
                        </button>
                        <button 
                            onClick={() => setShowDeleteConfirm(false)} 
                            className="flex-1 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </Sheet>

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
          <form onSubmit={handleSearch} className="flex gap-2">
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
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Search
            </button>
          </form>
          
          {searchedProfile && (
            <div className="border-t pt-6">
              <ProfileDetails ensName={searchedProfile} />
              
              {!graphData.nodes.some(n => n.id === searchedProfile) && (
                <button 
                    onClick={() => {
                        addNode(searchedProfile);
                        setIsSearchOpen(false); 
                    }}
                    className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    Add to Graph
                </button>
              )}
            </div>
          )}
        </div>
      </Sheet>
      </main>
  );
}
