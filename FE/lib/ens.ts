import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const getEnsProfile = async (ensName: string) => {
  try {
    const address = await publicClient.getEnsAddress({
      name: normalize(ensName),
    });

    if (!address) return null;

    const [avatar, description, twitter, github, email, url] = await Promise.all([
      publicClient.getEnsAvatar({ name: normalize(ensName) }),
      publicClient.getEnsText({ name: normalize(ensName), key: 'description' }),
      publicClient.getEnsText({ name: normalize(ensName), key: 'com.twitter' }),
      publicClient.getEnsText({ name: normalize(ensName), key: 'com.github' }),
      publicClient.getEnsText({ name: normalize(ensName), key: 'email' }),
      publicClient.getEnsText({ name: normalize(ensName), key: 'url' }),
    ]);

    return {
      ensName,
      address,
      avatar,
      description,
      socials: {
        twitter,
        github,
        email,
        url,
      },
    };
  } catch (error) {
    console.error('Error fetching ENS profile:', error);
    return null;
  }
};

// Helper to normalize ENS names (important for consistency)


