import React from 'react';
import { History, ArrowRight, Clock, Hash, Coins } from 'lucide-react';

interface Transaction {
  id: number;
  from: string;
  to: string;
  amount: string;
  hash: string;
  createdAt: string;
}

interface LedgerProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function Ledger({ transactions, isLoading }: LedgerProps) {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-500">Retrieving ledger entries...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <History className="h-8 w-8 text-gray-300" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">No Transactions found</h3>
          <p className="mt-1 text-sm text-gray-500">Records will appear here once you send a transaction.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Recent Transactions</p>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
          {transactions.length} Total
        </span>
      </div>

      <div className="grid gap-3">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className="group relative flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
          >
            {/* Amount Badge */}
            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 text-[11px] font-bold text-gray-700 ring-1 ring-inset ring-gray-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:ring-blue-100">
              <Coins className="h-3 w-3" />
              {tx.amount} ETH
            </div>

            {/* Path View */}
            <div className="flex items-center gap-2">
              <div className="flex max-w-[120px] flex-col">
                <span className="text-[11px] font-medium text-gray-400">From</span>
                <span className="truncate text-sm font-semibold text-gray-900" title={tx.from}>{tx.from}</span>
              </div>
              <div className="mt-4 flex flex-1 items-center justify-center">
                <div className="h-px flex-1 bg-gray-100 group-hover:bg-blue-100"></div>
                <ArrowRight className="mx-2 h-3 w-3 text-gray-300 group-hover:text-blue-400" />
                <div className="h-px flex-1 bg-gray-100 group-hover:bg-blue-100"></div>
              </div>
              <div className="flex max-w-[120px] flex-col text-right">
                <span className="text-[11px] font-medium text-gray-400">To</span>
                <span className="truncate text-sm font-semibold text-gray-900" title={tx.to}>{tx.to}</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-1">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <Hash className="h-3 w-3" />
                <span className="font-mono">{tx.hash.slice(0, 10)}...</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <Clock className="h-3 w-3" />
                {new Date(tx.createdAt).toLocaleString(undefined, { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
