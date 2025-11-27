'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ProfileSearch() {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    
    const name = input.trim().toLowerCase().endsWith('.eth') 
      ? input.trim() 
      : `${input.trim()}.eth`;
      
    router.push(`/profile/${name}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          &larr; Back to Graph
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Search Profiles</h1>
          <p className="mt-2 text-sm text-gray-600">
            Lookup any ENS profile directly
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              className={cn(
                "block w-full rounded-md border-0 py-4 pl-4 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300",
                "placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              )}
              placeholder="vitalik.eth"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center rounded-r-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

