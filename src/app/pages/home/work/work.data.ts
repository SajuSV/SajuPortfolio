export interface WorkItem {
  /** "01 — Figma | Photoshop" */
  eyebrow: string;
  /** "01 — Web Design" (vertical label while collapsed) */
  peekLabel: string;
  title: string;
  desc: string;
  tags: string[];
  img: string;
  gradient: string;
  delay: string;
  route: string;
}

const COVERS = 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/';

export const WORK_ITEMS: WorkItem[] = [
  {
    eyebrow: '01 — Figma | Photoshop',
    peekLabel: '01 — Web Design',
    title: 'Web Design',
    desc: 'Designed interfaces and page layouts in Figma and Photoshop, shaped around client requirements and wireframes.',
    tags: ['UI/UX Designer', 'Figma', 'Photoshop'],
    img: COVERS + 'webdesign.webp',
    gradient: 'linear-gradient(135deg,#3b2a6b,#1d1a3a)',
    delay: '0.00s',
    route: '/projects/webdesign',
  },
  {
    eyebrow: '02 — Photoshop',
    peekLabel: '02 — Poster Design',
    title: 'Poster Design',
    desc: 'Posters, business cards and photo edits made in Photoshop, with image retouching, colour correction and layouts.',
    tags: ['Visual Designer', 'Photoshop'],
    img: COVERS + 'posters.webp',
    gradient: 'linear-gradient(135deg,#6b2a3b,#2a1a22)',
    delay: '0.10s',
    route: '/projects/posterdesign',
  },
  {
    eyebrow: '03 — Html | CSS | JS | WordPress | Angular',
    peekLabel: '03 — Web Development',
    title: 'Web Development',
    desc: 'Responsive, visually engaging web pages built from UI/UX designs, focused on user experience, performance and visual consistency.',
    tags: ['UI/UX Developer', 'HTML', 'CSS', 'JS', 'WordPress', 'Angular'],
    img: COVERS + 'Web.webp',
    gradient: 'linear-gradient(135deg,#6b4a1f,#2a2013)',
    delay: '0.20s',
    route: '/projects/webdev',
  },
];
