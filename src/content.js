// ─────────────────────────────────────────────────────────────
//  All site copy and data lives here. Layout and motion read from
//  these objects. Work and details come from Shirsha
//  Bhattacharjee's Behance (behance.net/artofshirsha); images are
//  in public/work (4:3 crops) and public/work/wide (full frames).
// ─────────────────────────────────────────────────────────────

const BEHANCE = 'https://www.behance.net/artofshirsha'
const RAKHI = 'https://www.behance.net/gallery/255096093/Visual-Campaign-Rakhi26'

export const site = {
  brand: 'SwigPort',
  // The brand splits into two halves that live in the bottom corners
  // and merge at the end of every page.
  brandParts: ['Swig', 'Port'],
  firstName: 'Shirsha',
  lastName: 'Bhattacharjee',
  role: ['Senior Visualizer,', 'Designer & Illustrator'],
  city: 'Kolkata',
  timeZone: 'Asia/Kolkata',
  workingWith: { label: 'Swiggy', href: 'https://www.swiggy.com/' },
  workYears: ['22', '26'],
  year: "'26",
  rights: "'26 © All Rights Reserved",
  signature: 'poured in Kolkata',
  description:
    'Senior visualizer at Swiggy. Designs campaigns, brand identities, apps and illustration that carry Indian culture into the way people shop and scroll today.',
  availability: ['Available for', 'freelance & full-time'],
  contact: { lead: 'Say hello on:', label: 'behance.net/artofshirsha', href: BEHANCE },
  behance: BEHANCE,
}

// Hero headline groups (each string is one line)
export const hero = {
  lineA: ['Crafting', 'Visual', 'Stories,'],
  lineB: ['Campaigns,', 'Brands &', 'Illus-', 'tration.'],
  statement: { lead: 'every', next: 'thread', rest: ['ties a story', 'together.'] },
}

export const socials = [
  { id: 'instagram', label: 'Instagram', short: 'ig', href: 'https://instagram.com/artof.shirsha' },
  { id: 'linkedin', label: 'LinkedIn', short: 'in', href: 'https://www.linkedin.com/in/shirsha-bhattacharjee-09178b1b6/' },
  { id: 'behance', label: 'Behance', short: 'Be', href: BEHANCE },
]

// Footer manifesto — the live Kolkata clock sits between the halves.
export const manifesto = {
  top: [['Like good port,', 'great work'], ['is aged', 'slowly']],
  bottom: [['then', 'poured'], ['all at', 'once.']],
}

const img = (file) => ({ image: `/work/${file}.webp`, wide: `/work/wide/${file}.webp` })

// Rakhi'26 — visual campaign for the Swiggy Instamart app (2026)
export const rakhi = {
  title: "Rakhi'26",
  href: RAKHI,
  frames: [
    'Key visual',
    'About the campaign',
    'Main Lottie concept',
    'Cluster visuals',
    'Style exploration',
    'Sibling Debt Calculator',
    'In-app preview',
    'For your partner-in-crime',
    'Unique personalities',
    'Make your Rakhi thali',
    'The Glam Edit',
    'Shop by their personality',
    'Popular characters',
  ].map((label, i) => ({ label, ...img(`rakhi-${String(i + 1).padStart(2, '0')}`) })),
}

// Work grid order. "Case" = a whole project, "Shot" = one frame.
export const projects = [
  { id: 'rakhi', title: "Rakhi'26", kind: 'Case', category: 'Visual campaign, Swiggy Instamart', year: '2026', href: RAKHI, ...img('rakhi-01') },
  { id: 'rakhi-preview', title: "Rakhi'26 — In-app preview", kind: 'Shot', category: 'Raksha Bandhan is coming', year: '2026', href: RAKHI, ...img('rakhi-07') },
  { id: 'within-beauty', title: 'Within Beauty', kind: 'Case', category: 'Skincare brand design', year: '2024', href: 'https://www.behance.net/gallery/192267045/Skincare-Brand-Design-Within-Beauty', ...img('within-beauty') },
  { id: 'pet-store', title: 'Pet Store App', kind: 'Case', category: 'App page design', year: '2026', href: 'https://www.behance.net/gallery/244619811/Pet-Store-App-Page-Design', ...img('pet-store') },
  { id: 'rakhi-personas', title: "Rakhi'26 — Style exploration", kind: 'Shot', category: 'Gifts your sister will love', year: '2026', href: RAKHI, ...img('rakhi-05') },
  { id: 'luxury-skincare', title: 'Luxury Skincare', kind: 'Case', category: 'Branding', year: '2026', href: 'https://www.behance.net/gallery/243007107/Branding-luxury-skincare', ...img('luxury-skincare') },
  { id: 'meco', title: 'Meco', kind: 'Case', category: 'Charity app, winning design', year: '2023', href: 'https://www.behance.net/gallery/175483093/Charity-App-Design-My-Winning-Design', ...img('charity-app') },
  { id: 'instapharma', title: 'Swiggy Instapharma', kind: 'Case', category: 'Pharmacy app page design', year: '2026', href: 'https://www.behance.net/gallery/244594805/Pharmacy-App-Page-design', ...img('pharmacy-app') },
  { id: 'rakhi-game', title: "Rakhi'26 — Sibling Debt Calculator", kind: 'Shot', category: 'In-app game frames', year: '2026', href: RAKHI, ...img('rakhi-06') },
  { id: 'fresh-feels', title: 'Fresh Feels', kind: 'Case', category: 'Skincare website design', year: '2023', href: 'https://www.behance.net/gallery/174167673/Skincare-Website-Design', ...img('skincare-website') },
  { id: 'visualization', title: 'Visualization at Swiggy', kind: 'Case', category: 'Visualization compilation', year: '2025', href: 'https://www.behance.net/gallery/222160655/Visualization-Compilation', ...img('visualization') },
  { id: 'naturali', title: 'Naturali', kind: 'Case', category: 'Brand identity', year: '2024', href: 'https://www.behance.net/gallery/199110121/Naturali-branding-Project', ...img('naturali') },
  { id: 'rakhi-thali', title: "Rakhi'26 — Rakhi thali", kind: 'Shot', category: 'Get all the essentials', year: '2026', href: RAKHI, ...img('rakhi-10') },
  { id: 'ai-photography', title: 'AI Photography × Design', kind: 'Case', category: 'Art direction', year: '2026', href: 'https://www.behance.net/gallery/244850689/AI-Photography-X-Design', ...img('ai-photography') },
  { id: 'book-cover', title: 'Book of Elephants', kind: 'Case', category: 'Book cover illustration', year: '2022', href: 'https://www.behance.net/gallery/135418211/Book-Cover-Design', ...img('book-cover') },
  { id: 'nykaa', title: 'Nykaa Skin Potion', kind: 'Case', category: 'Label design', year: '2022', href: 'https://www.behance.net/gallery/141745357/Nykaa-Skin-Potion-Label-Design', ...img('nykaa-label') },
  { id: 'rakhi-personality', title: "Rakhi'26 — Unique personality", kind: 'Shot', category: 'Shop by their personality', year: '2026', href: RAKHI, ...img('rakhi-12') },
  { id: 'rakhi-characters', title: "Rakhi'26 — Popular characters", kind: 'Shot', category: 'Gift them trendy', year: '2026', href: RAKHI, ...img('rakhi-13') },
]

// Floating pieces on the Experiments page
export const experiments = [
  ...rakhi.frames.map((f) => ({ label: `Rakhi'26 — ${f.label}`, src: f.wide, href: RAKHI })),
  ...projects.filter((p) => p.kind === 'Case' && p.id !== 'rakhi').map((p) => ({ label: p.title, src: p.wide, href: p.href })),
]

export const navLinks = [
  { label: 'Home', path: '/', index: 1 },
  { label: 'Work', path: '/work', index: 2 },
  { label: 'Contact', path: '/contact', index: 3 },
]

// Theme modes — every mode stays inside the port-wine & bone family.
export const themes = [
  { id: 'port', label: 'Port', bg: '#3a0a10', fg: '#f3ebe1' },
  { id: 'bone', label: 'Bone', bg: '#f3ebe1', fg: '#3a0a10' },
  { id: 'crimson', label: 'Crimson', bg: '#a3121c', fg: '#f7efe6' },
  { id: 'noir', label: 'Noir', bg: '#140406', fg: '#f3ebe1' },
  { id: 'rose', label: 'Rosé', bg: '#e8cfc6', fg: '#3a0a10' },
]
