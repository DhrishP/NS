import React, { useState, useEffect } from 'react';
import { Fingerprint, X, Loader2, ArrowRightLeft, Send } from 'lucide-react';

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sourceId: string, targetId: string, amount: string) => Promise<void>;
  nodes: { id: string }[];
}

export function TransactionModal({ isOpen, onClose, onConfirm, nodes }: TransactionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setSourceId('');
      setTargetId('');
      setAmount('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!sourceId || !targetId || !amount) return;
    setIsProcessing(true);
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    await onConfirm(sourceId, targetId, amount);
    setIsProcessing(false);
    onClose();
  };

  const isFormValid = sourceId && targetId && sourceId !== targetId && amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Send className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-gray-900">New Transaction</h3>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Sender</label>
            <select 
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              disabled={isProcessing}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-75"
            >
              <option value="" disabled>Select Sender...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id}>{n.id}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center -my-2 text-gray-300 relative z-10">
            <div className="bg-white px-2">
              <ArrowRightLeft className="h-4 w-4 rotate-90" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Recipient</label>
            <select 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              disabled={isProcessing}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-75"
            >
              <option value="" disabled>Select Recipient...</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id} disabled={n.id === sourceId}>{n.id}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Amount (ETH)</label>
            <input 
              type="number"
              step="0.001"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:opacity-75"
            />
          </div>

          <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4 mt-1 text-gray-500">
            <span>Estimated Network Fee</span>
            <span className="font-medium text-gray-900">~0.0012 ETH</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || !isFormValid}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
            ) : (
                'Sign Transaction'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
