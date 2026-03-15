

-- 1. Extend user_role to support NGOs
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ngo';

-- 2. Add reputation score to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;

-- 3. PROPOSALS & VOTING SYSTEM
CREATE TYPE proposal_status AS ENUM ('Draft', 'Active', 'Approved', 'Rejected', 'Closed');

CREATE TABLE proposals (
    proposal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    locality VARCHAR(255) NOT NULL, -- Matches user.city
    created_by UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    duration_days INTEGER DEFAULT 30,
    status proposal_status DEFAULT 'Active',
    min_participation_threshold INTEGER DEFAULT 10, -- Minimum votes required
    approval_percentage_threshold NUMERIC(5,2) DEFAULT 60.00, -- Required percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE proposal_votes (
    vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_ref UUID NOT NULL REFERENCES proposals(proposal_id) ON DELETE CASCADE,
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vote_type BOOLEAN NOT NULL, -- TRUE for Yes, FALSE for No
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(proposal_ref, user_ref)
);

-- 4. NEIGHBORHOOD HELP NETWORK
CREATE TYPE help_urgency AS ENUM ('Low', 'Medium', 'High', 'Emergency');
CREATE TYPE help_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Expired');

CREATE TABLE help_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Blood Donation', 'Emergency', 'Lost Pet', etc.
    urgency help_urgency DEFAULT 'Medium',
    location_ref UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    contact_preference VARCHAR(100), -- 'Phone', 'Chat', 'Email'
    status help_status DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 5. LOCAL EVENTS & ACTIVITIES
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organizer_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    location_ref UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Cleanup', 'Tree Plantation', 'Cultural', etc.
    status VARCHAR(50) DEFAULT 'Planned',
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE event_rsvps (
    rsvp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_ref UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'Going', 'Interested'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_ref, user_ref)
);

CREATE TABLE event_volunteers (
    volunteer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_ref UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_ref, user_ref)
);

-- 6. LOCAL BUSINESS & SERVICES DIRECTORY
CREATE TABLE businesses (
    business_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Plumber', 'Electrician', 'Doctor', etc.
    description TEXT,
    operating_hours JSONB,
    contact_info JSONB, -- {phone, email, website}
    location_ref UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE business_reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_ref UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(business_ref, user_ref)
);

-- 7. LOST AND FOUND SYSTEM
CREATE TABLE lost_found_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'Lost', 'Found'
    category VARCHAR(100) NOT NULL, -- 'Electronics', 'Pet', 'Wallet', etc.
    location_ref UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    image_url TEXT,
    contact_details TEXT,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. CIVIC PROJECT TRACKER
CREATE TABLE civic_projects (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authority_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- User with officer/admin role
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget NUMERIC(15, 2),
    contractor VARCHAR(255),
    start_date DATE,
    expected_completion DATE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    status VARCHAR(50) DEFAULT 'Ongoing',
    location_ref UUID REFERENCES locations(location_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE project_updates (
    update_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_ref UUID NOT NULL REFERENCES civic_projects(project_id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. PUBLIC SAFETY REPORTING
CREATE TABLE safety_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    category VARCHAR(100) NOT NULL, -- 'Broken Streetlight', 'Illegal Dumping', etc.
    location_ref UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    image_url TEXT,
    video_url TEXT,
    status VARCHAR(50) DEFAULT 'Reported',
    routed_to VARCHAR(255), -- 'Police', 'Municipal', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. SMART NEIGHBORHOOD ALERTS
CREATE TABLE community_alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    level VARCHAR(50) NOT NULL, -- 'Info', 'Warning', 'Emergency'
    broadcast_city VARCHAR(100) NOT NULL,
    broadcast_area VARCHAR(100), -- Optional specific area
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. LOCAL RESOURCE SHARING
CREATE TABLE resources (
    resource_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Tools', 'Books', 'Carpool', etc.
    location_ref UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    availability_status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE resource_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_ref UUID NOT NULL REFERENCES resources(resource_id) ON DELETE CASCADE,
    requester_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected', 'Returned'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. INFRASTRUCTURE FEEDBACK
CREATE TABLE infrastructure_feedback (
    feedback_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_ref UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'Roads', 'Parks', 'Lighting', 'Drainage', etc.
    location_ref UUID NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 13. MATERIALIZED VIEWS FOR DASHBOARDS
CREATE MATERIALIZED VIEW IF NOT EXISTS locality_stats AS
SELECT 
    l.city,
    l.area,
    COUNT(DISTINCT c.complaint_id) as total_complaints,
    COUNT(DISTINCT p.proposal_id) as total_proposals,
    COUNT(DISTINCT e.event_id) as total_events,
    AVG(if.rating) as avg_infra_rating
FROM locations l
LEFT JOIN complaints c ON c.location_ref = l.location_id
LEFT JOIN proposals p ON p.locality = l.city
LEFT JOIN events e ON e.location_ref = l.location_id
LEFT JOIN infrastructure_feedback if ON if.location_ref = l.location_id
GROUP BY l.city, l.area;

-- 13b. VIEW FOR HELP REQUESTS WITH LOCATION
CREATE OR REPLACE VIEW help_requests_with_location AS
SELECT
  h.*,
  u.name as creator_name,
  u.reputation_score as creator_reputation,
  l.area,
  l.city,
  l.state,
  l.pincode,
  l.latitude,
  l.longitude
FROM help_requests h
JOIN users u ON u.user_id = h.user_ref
JOIN locations l ON l.location_id = h.location_ref;

-- 14. FUNCTIONS & TRIGGERS FOR REPUTATION SYSTEM
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS trigger AS $$
BEGIN
    -- Basic logic: Add 10 points for certain activities
    IF (TG_OP = 'INSERT') THEN
        UPDATE users SET reputation_score = reputation_score + 10 WHERE user_id = NEW.user_ref;
    ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'Resolved' AND OLD.status != 'Resolved') THEN
        -- Bonus points for resolving a help request
        UPDATE users SET reputation_score = reputation_score + 50 WHERE user_id = NEW.user_ref;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Map reputations to various tables
CREATE TRIGGER on_vote_added AFTER INSERT ON proposal_votes FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();
CREATE TRIGGER on_event_rsvp AFTER INSERT ON event_rsvps FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();
CREATE TRIGGER on_feedback_added AFTER INSERT ON infrastructure_feedback FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();
CREATE TRIGGER on_help_resolved AFTER UPDATE ON help_requests FOR EACH ROW EXECUTE PROCEDURE update_user_reputation();

-- 15. RLS POLICIES FOR NEW TABLES (Simplified for now, can be refined)
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE civic_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_feedback ENABLE ROW LEVEL SECURITY;

-- Common Policies
CREATE POLICY "Public can view active proposals" ON proposals FOR SELECT USING (status != 'Draft');
CREATE POLICY "Users can create proposals" ON proposals FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Everyone can see events" ON events FOR SELECT USING (true);
CREATE POLICY "Everyone can see help requests" ON help_requests FOR SELECT USING (true);
CREATE POLICY "Everyone can see businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Everyone can see safety reports" ON safety_reports FOR SELECT USING (true);
CREATE POLICY "Everyone can see items" ON lost_found_items FOR SELECT USING (true);
CREATE POLICY "Everyone can see civic projects" ON civic_projects FOR SELECT USING (true);
CREATE POLICY "Everyone can see alerts" ON community_alerts FOR SELECT USING (true);
CREATE POLICY "Everyone can see resources" ON resources FOR SELECT USING (true);

-- Enable Realtime for all new tables
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE help_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE lost_found_items;
ALTER PUBLICATION supabase_realtime ADD TABLE civic_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE safety_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE community_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE resources;
