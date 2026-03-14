-- Fix: Allow authenticated users to insert locations when creating complaints
CREATE POLICY "Authenticated users can insert locations"
ON locations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
