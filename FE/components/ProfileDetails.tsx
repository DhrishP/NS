'use client';

import { useEffect, useState } from 'react';
import { getEnsProfile } from '@/lib/ens';

interface ProfileDetailsProps {
  ensName: string;
}

export default function ProfileDetails({ ensName }: ProfileDetailsProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function fetchProfile() {
      if (!ensName) return;
      setLoading(true);
      setError(false);
      
      try {
        const data = await getEnsProfile(ensName);
        if (mounted) {
          if (data) {
            setProfile(data);
          } else {
            setError(true);
          }
        }
      } catch (e) {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProfile();
    return () => { mounted = false; };
  }, [ensName]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-center text-red-600">
        Could not load profile for <strong>{ensName}</strong>.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Profile Image */}
      <div className="flex flex-col items-center">
        <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-gray-100 bg-white shadow-md">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.ensName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-4xl">
              👻
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{profile.ensName}</h2>
        <p className="font-mono text-xs text-gray-500">{profile.address}</p>
      </div>

      {/* Description */}
      {profile.description && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 border">
          {profile.description}
        </div>
      )}

      {/* Socials */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Connected Accounts
        </h3>
        {Object.entries(profile.socials).map(([key, value]) => {
          if (!value) return null;
          // Cast value to string for safety
          const displayValue = String(value);
          return (
            <div key={key} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span className="font-medium text-gray-500 capitalize">{key}</span>
              <a 
                href={getLink(key, displayValue)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline truncate max-w-[200px]"
              >
                {displayValue}
              </a>
            </div>
          );
        })}
        {Object.values(profile.socials).every(v => !v) && (
            <p className="text-sm text-gray-400 italic">No connected accounts found.</p>
        )}
      </div>
    </div>
  );
}

function getLink(key: string, value: string): string {
  if (key === 'twitter' || key === 'com.twitter') return `https://twitter.com/${value}`;
  if (key === 'github' || key === 'com.github') return `https://github.com/${value}`;
  if (key === 'url') return value.startsWith('http') ? value : `https://${value}`;
  if (key === 'email') return `mailto:${value}`;
  return '#';
}

