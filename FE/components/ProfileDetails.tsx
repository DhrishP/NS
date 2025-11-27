"use client";

import { useEffect, useState } from "react";
import { getEnsProfile } from "@/lib/ens";
import { Twitter, Github, Globe, Mail, ExternalLink } from "lucide-react";

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
    return () => {
      mounted = false;
    };
  }, [ensName]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col items-center">
           <div className="h-32 w-32 rounded-full bg-gray-200 mb-4"></div>
           <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
           <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="h-20 w-full bg-gray-200 rounded-lg"></div>
        <div className="space-y-3">
            <div className="h-10 w-full bg-gray-200 rounded"></div>
            <div className="h-10 w-full bg-gray-200 rounded"></div>
        </div>
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
        
        <a 
            href={`https://etherscan.io/address/${profile.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 mt-1 transition-colors"
        >
            {profile.address.slice(0,6)}...{profile.address.slice(-4)}
            <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Description */}
      {profile.description && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 border">
          {profile.description}
        </div>
      )}

      {/* Socials */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Connected Accounts
        </h3>
        {Object.entries(profile.socials).map(([key, value]) => {
          if (!value) return null;
          const displayValue = String(value);
          const icon = getIcon(key);

          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm hover:border-gray-300 transition-colors bg-white shadow-sm group"
            >
              <div className="flex items-center gap-3 text-gray-600">
                 {icon}
                 <span className="font-medium capitalize">
                    {key.replace('com.', '')}
                 </span>
              </div>
              <a
                href={getLink(key, displayValue)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline truncate max-w-[150px] flex items-center gap-1"
              >
                {displayValue}
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          );
        })}
        {Object.values(profile.socials).every((v) => !v) && (
          <p className="text-sm text-gray-400 italic">
            No connected accounts found.
          </p>
        )}
      </div>
    </div>
  );
}

function getIcon(key: string) {
    if (key.includes("twitter")) return <Twitter className="h-4 w-4 text-blue-400" />;
    if (key.includes("github")) return <Github className="h-4 w-4 text-gray-900" />;
    if (key.includes("email")) return <Mail className="h-4 w-4 text-gray-500" />;
    return <Globe className="h-4 w-4 text-gray-500" />;
}

function getLink(key: string, value: string): string {
  if (key === "twitter" || key === "com.twitter")
    return `https://twitter.com/${value}`;
  if (key === "github" || key === "com.github")
    return `https://github.com/${value}`;
  if (key === "url")
    return value.startsWith("http") ? value : `https://${value}`;
  if (key === "email") return `mailto:${value}`;
  return "#";
}
