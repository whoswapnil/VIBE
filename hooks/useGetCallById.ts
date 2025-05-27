// Import React hooks and Stream Video tools
import { useEffect, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

// Custom hook to fetch a specific call by its ID
export const useGetCallById = (id: string | string[]) => {
  // Store the fetched call
  const [call, setCall] = useState<Call>();

  // Track whether the call data is still being loaded
  const [isCallLoading, setIsCallLoading] = useState(true);

  // Get the Stream Video client instance
  const client = useStreamVideoClient();

  // useEffect runs when client or id changes
  useEffect(() => {
    // Don't do anything if client isn't ready
    if (!client) return;

    // Async function to load the call from the server
    const loadCall = async () => {
      try {
        // Fetch the call(s) with the given ID using Stream's API
        const { calls } = await client.queryCalls({
          filter_conditions: { id }, // Filter by the provided ID
        });

        // If a call is found, store the first one in state
        if (calls.length > 0) setCall(calls[0]);

        // Mark loading as complete
        setIsCallLoading(false);
      } catch (error) {
        // Log any errors that occur during the fetch
        console.error(error);

        // Also stop the loading indicator
        setIsCallLoading(false);
      }
    };

    // Call the async function to fetch the call
    loadCall();

    // Re-run this effect if client or call ID changes
  }, [client, id]);

  // Return the fetched call and loading status to the component using this hook
  return { call, isCallLoading };
};
