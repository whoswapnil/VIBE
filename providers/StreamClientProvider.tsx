// This makes the file a Client Component in Next.js (used with hooks or browser-only code)
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk'; // Stream video SDK
import { useUser } from '@clerk/nextjs'; // To get the logged-in user
import { tokenProvider } from '@/actions/stream.actions'; // Custom token provider for Stream auth
import Loader from '@/components/Loader'; // A loading component while initializing

// Load your Stream API key from environment variables
const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

// This component wraps your app with Stream Video Client
const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  // State to hold the initialized Stream Video Client
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();

  // Get the current logged-in user and loading status from Clerk
  const { user, isLoaded } = useUser();

  // useEffect runs after the component mounts or when user/isLoaded changes
  useEffect(() => {
    // If Clerk hasn't finished loading or there's no user yet, exit early
    if (!isLoaded || !user) return;

    // If the API key is missing, throw an error
    if (!API_KEY) throw new Error('Stream API key is missing');

    // Create a new StreamVideoClient instance with user info
    const client = new StreamVideoClient({
      apiKey: API_KEY, // Stream API key
      user: {
        id: user.id, // Clerk user ID
        name: user.username || user.id, // Username or fallback to ID
        image: user.imageUrl, // User profile image
      },
      tokenProvider, // Used to get access tokens for this user
    });

    // Save the client to state
    setVideoClient(client);
  }, [user, isLoaded]);

  // Show a loader while video client is not ready
  if (!videoClient) return <Loader />;

  // Provide the StreamVideo context to children (entire app)
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
