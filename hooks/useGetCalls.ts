// Import necessary React hooks and tools from Clerk and Stream Video SDK
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';

// Custom hook to fetch video calls related to the current user
export const useGetCalls = () => {
  // Get the logged-in user from Clerk
  const { user } = useUser();

  // Get the Stream Video client to interact with the API
  const client = useStreamVideoClient();

  // Store fetched calls in state
  const [calls, setCalls] = useState<Call[]>();

  // Track loading state while fetching data
  const [isLoading, setIsLoading] = useState(false);

  // useEffect runs when client or user ID changes
  useEffect(() => {
    // Async function to load calls from Stream API
    const loadCalls = async () => {
      // If client or user is not ready, don't proceed
      if (!client || !user?.id) return;

      // Set loading to true before starting fetch
      setIsLoading(true);

      try {
        // Query Stream API for calls related to the user
        const { calls } = await client.queryCalls({
          // Sort calls by start time (newest first)
          sort: [{ field: 'starts_at', direction: -1 }],

          // Filter calls that:
          // - Have a start time
          // - Are either created by the user or include the user as a member
          filter_conditions: {
            starts_at: { $exists: true },
            $or: [
              { created_by_user_id: user.id },
              { members: { $in: [user.id] } },
            ],
          },
        });

        // Store fetched calls in state
        setCalls(calls);
      } catch (error) {
        // Log any error that occurs while fetching
        console.error(error);
      } finally {
        // Stop loading indicator after fetch completes
        setIsLoading(false);
      }
    };

    // Call the function to fetch calls
    loadCalls();

    // Re-run this effect if client or user ID changes
  }, [client, user?.id]);

  // Get the current time to compare with call start times
  const now = new Date();

  // Filter calls that have already ended
  const endedCalls = calls?.filter(({ state: { startsAt, endedAt } }: Call) => {
    return (startsAt && new Date(startsAt) < now) || !!endedAt;
  });

  // Filter calls that are scheduled for the future
  const upcomingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
    return startsAt && new Date(startsAt) > now;
  });

  // Return the calls grouped by status, raw call data, and loading state
  return { endedCalls, upcomingCalls, callRecordings: calls, isLoading };
};
