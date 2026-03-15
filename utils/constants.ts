// Maharashtra State Localities
export const MAHARASHTRA_CITIES = [
  'Mumbai',
  'Thane',
  'Navi Mumbai',
  'Panvel',
  'Pune',
  'Nashik',
  'Satara',
  'Aurangabad',
  'Nagpur',
  'Solapur',
  'Kolhapur',
  'Vasai-Virar',
  'Bhiwandi',
  'Kalyan',
  'Dombivli',
  'Pimpri-Chinchwad',
  'Ulhasnagar',
  'Sangli',
  'Ratnagiri',
  'Alibaug',
] as const

export const CITIES = MAHARASHTRA_CITIES

export type MaharashtraCity = typeof MAHARASHTRA_CITIES[number]

// Officer Types / Roles
export const OFFICER_TYPES = [
  { value: 'Police', label: '🚔 Police', color: 'blue', description: 'Local police station, crime & law enforcement' },
  { value: 'Municipal Worker', label: '🏗️ Municipal Worker', color: 'orange', description: 'BMC / TMC / NMC civic maintenance' },
  { value: 'Nagarsevak', label: '🏛️ Nagarsevak', color: 'green', description: 'Ward councillor / Nagar Panchayat representative' },
  { value: 'MLA', label: '⚖️ MLA', color: 'purple', description: 'Member of Legislative Assembly' },
  { value: 'Cyber Cell', label: '💻 Cyber Cell', color: 'red', description: 'Cyber crime investigation unit' },
  { value: 'Fire Brigade', label: '🔥 Fire Brigade', color: 'red', description: 'Fire department & emergency response' },
  { value: 'Health Officer', label: '🏥 Health Officer', color: 'teal', description: 'Public health & sanitation authority' },
  { value: 'PWD Engineer', label: '🛣️ PWD Engineer', color: 'yellow', description: 'Public Works Department - roads & infrastructure' },
  { value: 'Water Supply Officer', label: '💧 Water Supply Officer', color: 'cyan', description: 'Water supply & drainage authority' },
  { value: 'Revenue Officer', label: '📋 Revenue Officer', color: 'slate', description: 'Land & revenue administration' },
] as const

export type OfficerType = typeof OFFICER_TYPES[number]['value']

// Complaint Categories with officer type mapping
export const COMPLAINT_CATEGORIES = [
  { value: 'roads', label: 'Roads & Potholes', relevantOfficers: ['Municipal Worker', 'PWD Engineer'] },
  { value: 'sanitation', label: 'Sanitation & Garbage', relevantOfficers: ['Municipal Worker', 'Health Officer'] },
  { value: 'water supply', label: 'Water Supply & Leaks', relevantOfficers: ['Water Supply Officer', 'Municipal Worker'] },
  { value: 'electricity', label: 'Electricity & Street Lights', relevantOfficers: ['Municipal Worker', 'PWD Engineer'] },
  { value: 'public safety', label: 'Public Safety & Hazards', relevantOfficers: ['Police', 'Nagarsevak'] },
  { value: 'noise complaint', label: 'Noise Complaint', relevantOfficers: ['Police', 'Municipal Worker'] },
  { value: 'illegal construction', label: 'Illegal Construction', relevantOfficers: ['Municipal Worker', 'Revenue Officer'] },
  { value: 'traffic', label: 'Traffic Issues', relevantOfficers: ['Police', 'Municipal Worker'] },
  { value: 'stray animals', label: 'Stray Animals', relevantOfficers: ['Municipal Worker', 'Health Officer'] },
  { value: 'tree/park maintenance', label: 'Tree / Park Maintenance', relevantOfficers: ['Municipal Worker', 'Nagarsevak'] },
  { value: 'cybercrime', label: 'Cyber Crime', relevantOfficers: ['Cyber Cell', 'Police'] },
  { value: 'domestic violence', label: 'Domestic Violence', relevantOfficers: ['Police'] },
  { value: 'eve teasing', label: 'Eve Teasing / Harassment', relevantOfficers: ['Police', 'Cyber Cell'] },
  { value: 'drainage/sewage', label: 'Drainage & Sewage', relevantOfficers: ['Water Supply Officer', 'Municipal Worker'] },
  { value: 'fire hazard', label: 'Fire Hazard', relevantOfficers: ['Fire Brigade', 'Municipal Worker'] },
] as const

// Help Request Categories
export const HELP_CATEGORIES = [
  { value: 'blood donation', label: '🩸 Blood Donation' },
  { value: 'emergency', label: '🚨 Emergency Assistance' },
  { value: 'lost pet', label: '🐕 Lost Pet' },
  { value: 'volunteer', label: '🤝 Volunteer Needed' },
  { value: 'grocery', label: '🛒 Grocery / Essentials' },
  { value: 'medical', label: '💊 Medical Support' },
] as const

// Event Categories
export const EVENT_CATEGORIES = [
  { value: 'cleanup', label: '🧹 Cleanup Drive' },
  { value: 'tree plantation', label: '🌱 Tree Plantation' },
  { value: 'cultural', label: '🎭 Cultural Festival' },
  { value: 'blood camp', label: '💉 Blood Donation Camp' },
  { value: 'workshop', label: '👨‍🏫 Skill Workshop' },
  { value: 'sports', label: '⚽ Sports Event' },
] as const

// Business Categories
export const BUSINESS_CATEGORIES = [
  { value: 'plumber', label: '🔧 Plumber' },
  { value: 'electrician', label: '⚡ Electrician' },
  { value: 'doctor', label: '👨‍⚕️ Doctor' },
  { value: 'pharmacy', label: '💊 Pharmacy' },
  { value: 'grocery', label: '🛒 Grocery Store' },
  { value: 'mechanic', label: '🚗 Mechanic' },
  { value: 'restaurant', label: '🍕 Restaurant' },
] as const

// Resource Categories
export const RESOURCE_CATEGORIES = [
  { value: 'tools', label: '🛠️ Tools & Equipment' },
  { value: 'books', label: '📚 Books' },
  { value: 'carpool', label: '🚗 Carpool' },
  { value: 'knowledge', label: '🧠 Knowledge Sharing' },
  { value: 'furniture', label: '🛋️ Furniture' },
] as const

// Proposal Categories
export const PROPOSAL_CATEGORIES = [
  { value: 'infrastructure', label: '🏗️ Infrastructure' },
  { value: 'parks', label: '🌳 Parks & Greenery' },
  { value: 'safety', label: '🛡️ Public Safety' },
  { value: 'lighting', label: '💡 Street Lighting' },
  { value: 'drainage', label: '🌉 Drainage & Sewage' },
] as const

// Lost & Found Categories
export const LOST_FOUND_CATEGORIES = [
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'pets', label: '🐈 Pets' },
  { value: 'documents', label: '📄 Documents' },
  { value: 'wallet', label: '👛 Wallet / Purse' },
  { value: 'keys', label: '🔑 Keys' },
  { value: 'others', label: '📦 Others' },
] as const

// Color map for officer badges
export const OFFICER_TYPE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  'Police':                { bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-600/20' },
  'Municipal Worker':      { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-600/20' },
  'Nagarsevak':            { bg: 'bg-green-50',  text: 'text-green-700',  ring: 'ring-green-600/20' },
  'MLA':                   { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-600/20' },
  'Cyber Cell':            { bg: 'bg-red-50',    text: 'text-red-700',    ring: 'ring-red-600/20' },
  'Fire Brigade':          { bg: 'bg-rose-50',   text: 'text-rose-700',   ring: 'ring-rose-600/20' },
  'Health Officer':        { bg: 'bg-teal-50',   text: 'text-teal-700',   ring: 'ring-teal-600/20' },
  'PWD Engineer':          { bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-600/20' },
  'Water Supply Officer':  { bg: 'bg-cyan-50',   text: 'text-cyan-700',   ring: 'ring-cyan-600/20' },
  'Revenue Officer':       { bg: 'bg-slate-100', text: 'text-slate-700',  ring: 'ring-slate-600/20' },
}

