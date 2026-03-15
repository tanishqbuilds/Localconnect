'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function RealtimeSubscriber({ tables }: { tables: string[] }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Create multiple channels for each table
    const channels = tables.map((tableName) => {
      const channelLabel = `realtime-${tableName}-${Math.random().toString(36).substring(7)}`;

      return supabase
        .channel(channelLabel)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload) => {
            console.log(`Realtime change received for ${tableName}:`, payload);
            router.refresh(); // Tells Next.js to re-fetch Server Components
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Successfully subscribed to realtime events for table: ${tableName}`);
          }
        });
    });

    return () => {
      // Cleanup subscriptions on unmount
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });
    };
  }, [supabase, router, tables]);

  return null; // This component doesn't render anything
}
