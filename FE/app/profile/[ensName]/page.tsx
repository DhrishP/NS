import { getEnsProfile } from '@/lib/ens';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ ensName: string }>;
}) {
  const { ensName } = await params;
  const decodedName = decodeURIComponent(ensName);
  const profile = await getEnsProfile(decodedName);

  if (!profile || !profile.address) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          &larr; Back to Search
        </Link>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          {/* Header / Banner */}
          <div className="h-32 w-full bg-linear-to-r from-blue-500 to-purple-600"></div>

          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6 flex justify-between">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.ensName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 text-4xl">
                    👻
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{profile.ensName}</h1>
              <p className="font-mono text-sm text-gray-500">{profile.address}</p>
            </div>

            {profile.description && (
              <div className="mb-8 rounded-md bg-gray-50 p-4">
                <p className="text-gray-700">{profile.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Object.entries(profile.socials).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div key={key} className="flex items-center space-x-3 rounded-md border border-gray-100 p-3 shadow-sm">
                    <span className="text-xs font-semibold uppercase text-gray-400">{key}</span>
                    <span className="truncate text-sm font-medium text-gray-900">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

