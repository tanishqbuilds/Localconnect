-- Add missing INSERT RLS policies for various modules

-- 1. Help Requests
CREATE POLICY "Users can insert help requests" 
ON help_requests FOR INSERT 
WITH CHECK (auth.uid() = user_ref);

-- 2. Community Alerts
CREATE POLICY "Users can insert community alerts" 
ON community_alerts FOR INSERT 
WITH CHECK (auth.uid() = author_ref);

-- 3. Events
CREATE POLICY "Users can insert events" 
ON events FOR INSERT 
WITH CHECK (auth.uid() = organizer_ref);

CREATE POLICY "Users can insert event rsvps" 
ON event_rsvps FOR INSERT 
WITH CHECK (auth.uid() = user_ref);

-- 4. Businesses
CREATE POLICY "Users can insert businesses" 
ON businesses FOR INSERT 
WITH CHECK (auth.uid() = owner_ref);

-- Refresh schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
