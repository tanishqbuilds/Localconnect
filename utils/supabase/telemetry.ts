export function applyTelemetryProxy(client: any) {
  // Only apply telemetry in development for demonstration purposes
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_ENABLE_ADBMS_TELEMETRY) {
    return client;
  }

  const originalFrom = client.from.bind(client);
  
  client.from = (table: string) => {
    const builder = originalFrom(table);
    
    const hookMethod = (methodName: string, originalMethod: Function) => {
      return (...args: any[]) => {
        // Fire and forget the telemetry broadcast
        try {
          const payload = {
            table,
            eventType: methodName.toUpperCase(),
            timestamp: new Date().toLocaleTimeString(),
            new: args[0] || null,
            old: null, // Since we intercept pre-flight, we might not have old WAL
            isIntercepted: true // Custom flag to identify proxy events
          };

          fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            },
            body: JSON.stringify({
              messages: [{
                topic: "realtime:schema-db-changes",
                event: "postgres_changes", // reuse the same event name to seamlessly integrate into db-live
                payload
              }]
            })
          }).catch((e) => console.log('Telemetry drop', e.message))
        } catch(e) {}
        
        return originalMethod.apply(builder, args);
      }
    }
    
    if (builder.select) builder.select = hookMethod('select', builder.select);
    if (builder.insert) builder.insert = hookMethod('insert', builder.insert);
    if (builder.update) builder.update = hookMethod('update', builder.update);
    if (builder.delete) builder.delete = hookMethod('delete', builder.delete);
    if (builder.upsert) builder.upsert = hookMethod('upsert', builder.upsert);
    
    return builder;
  }
  return client;
}
