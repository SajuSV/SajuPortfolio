/** Content of the four project pages (extracted 1:1 from the old projects/<name>/index.html files). */

export interface CarouselImage {
  src: string;
  alt: string;
}
export interface ColumnsCarousel {
  kind: 'columns';
  label: string;
  /** three drifting columns; each list is rendered once, then once more as aria-hidden copies for a seamless loop */
  columns: { durationSeconds: number; images: CarouselImage[] }[];
}
export interface StripItem {
  /** button → opens the lightbox, link → external site, static → plain tile */
  kind: 'button' | 'link' | 'static';
  light: boolean;
  /** aria-hidden duplicate used for the seamless loop */
  hidden: boolean;
  src: string;
  alt: string;
  href?: string;
}
export interface StripCarousel {
  kind: 'strip';
  label: string;
  durationSeconds: number;
  items: StripItem[];
}
export interface ProjectData {
  slug: string;
  title: string;
  metaDescription: string;
  /** greyed first part of the headline */
  headlineDim: string;
  headlineRest: string;
  description: string;
  meta: { label: string; value: string }[];
  cover: string;
  coverAlt: string;
  carousel: ColumnsCarousel | StripCarousel;
  /** slugs shown in the "More work" row, in display order */
  more: { slug: string; label: string }[];
}

export const PROJECTS: ProjectData[] = [
  {
    slug: 'webdesign',
    title: 'Web Design',
    metaDescription: 'Web page designs created primarily in Figma, with Photoshop used for image editing and visual assets. Some of the web page designs I have worked on ar',
    headlineDim: 'Interfaces designed',
    headlineRest: ' to be easy to use.',
    description: 'Web page designs created primarily in Figma, with Photoshop used for image editing and visual assets. Some of the web page designs I have worked on are showcased below.',
    meta: [
      { label: 'Focus', value: 'Web Design' },
      { label: 'Tools', value: 'Figma & Photoshop' },
      { label: 'Purpose', value: 'Prototype' },
    ],
    cover: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/webdesign.webp',
    coverAlt: 'Web Design cover',
    carousel: {
      kind: 'columns',
      label: 'Webpage Design',
      columns: [
        {
          durationSeconds: 60,
          images: [
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/1.webp', alt: 'UI Design 1' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/4.webp', alt: 'UI Design 4' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/7.webp', alt: 'UI Design 7' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/10.webp', alt: 'UI Design 10' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/13.webp', alt: 'UI Design 13' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/16.webp', alt: 'UI Design 16' },
          ],
        },
        {
          durationSeconds: 60,
          images: [
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/2.webp', alt: 'UI Design 2' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/5.webp', alt: 'UI Design 5' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/8.webp', alt: 'UI Design 8' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/11.webp', alt: 'UI Design 11' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/14.webp', alt: 'UI Design 14' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/17.webp', alt: 'UI Design 17' },
          ],
        },
        {
          durationSeconds: 50,
          images: [
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/3.webp', alt: 'UI Design 3' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/6.webp', alt: 'UI Design 6' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/9.webp', alt: 'UI Design 9' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/12.webp', alt: 'UI Design 12' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/Ui/15.webp', alt: 'UI Design 15' },
          ],
        },
      ],
    },
    more: [
      { slug: 'posterdesign', label: 'Poster Design' },
      { slug: 'webdev', label: 'Web Development' },
    ],
  },
  {
    slug: 'posterdesign',
    title: 'Poster Design',
    metaDescription: 'Creative posters and promotional graphics designed in Photoshop and Figma, featuring bold visuals, strong typography, and engaging compositions for va',
    headlineDim: 'Posters',
    headlineRest: ' with bold visuals and strong type.',
    description: 'Creative posters and promotional graphics designed in Photoshop and Figma, featuring bold visuals, strong typography, and engaging compositions for various themes and campaigns. Some selected designs are showcased below.',
    meta: [
      { label: 'Focus', value: 'Poster Design' },
      { label: 'Tools', value: 'Photoshop' },
      { label: 'Purpose', value: 'Social media' },
    ],
    cover: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/posters.webp',
    coverAlt: 'Poster Design cover',
    carousel: {
      kind: 'columns',
      label: 'Poster Designs',
      columns: [
        {
          durationSeconds: 50,
          images: [
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon8.webp', alt: 'Poster 1' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon4.webp', alt: 'Poster 4' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon7.webp', alt: 'Poster 7' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon2a.webp', alt: 'Poster 10' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon5a.webp', alt: 'Poster 13' },
          ],
        },
        {
          durationSeconds: 40,
          images: [
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon2.webp', alt: 'Poster 2' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon5.webp', alt: 'Poster 5' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon1.webp', alt: 'Poster 8' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon3a.webp', alt: 'Poster 11' },
          ],
        },
        {
          durationSeconds: 40,
          images: [
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon3.webp', alt: 'Poster 3' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon6.webp', alt: 'Poster 6' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon1a.webp', alt: 'Poster 9' },
            { src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/designs/aatoon4a.webp', alt: 'Poster 12' },
          ],
        },
      ],
    },
    more: [
      { slug: 'webdesign', label: 'Web Design' },
      { slug: 'webdev', label: 'Web Development' },
    ],
  },
  {
    slug: 'logodesign',
    title: 'Logo Design',
    metaDescription: 'Logo designs created to visually represent brands, crafted using professional tools. Each piece balances creativity with strategic communication.',
    headlineDim: 'Logos',
    headlineRest: ' that carry a brand.',
    description: 'Logo designs created to visually represent brands, crafted using professional tools. Each piece balances creativity with strategic communication.',
    meta: [
      { label: 'Focus', value: 'Logo Design' },
      { label: 'Tools', value: 'Photoshop & Figma' },
      { label: 'Purpose', value: 'Brand identity' },
    ],
    cover: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo.webp',
    coverAlt: 'Logo Design cover',
    carousel: {
      kind: 'strip',
      label: 'Logo Design',
      durationSeconds: 128,
      items: [
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo1.webp', alt: 'Logo 1' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo2.webp', alt: 'Logo 2' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo3.webp', alt: 'Logo 3' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo4.webp', alt: 'Logo 4' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo1.webp', alt: 'Logo 1' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo2.webp', alt: 'Logo 2' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo3.webp', alt: 'Logo 3' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo4.webp', alt: 'Logo 4' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo1.webp', alt: 'Logo 1' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo2.webp', alt: 'Logo 2' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo3.webp', alt: 'Logo 3' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo4.webp', alt: 'Logo 4' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo1.webp', alt: 'Logo 1' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo2.webp', alt: 'Logo 2' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo3.webp', alt: 'Logo 3' },
        { kind: 'button', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo4.webp', alt: 'Logo 4' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo1.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo2.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo3.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo4.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo1.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo2.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo3.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo4.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo1.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo2.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo3.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo4.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo1.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo2.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo3.webp', alt: '' },
        { kind: 'button', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/logo4.webp', alt: '' },
      ],
    },
    more: [
      { slug: 'webdesign', label: 'Web Design' },
      { slug: 'posterdesign', label: 'Poster Design' },
      { slug: 'webdev', label: 'Web Development' },
    ],
  },
  {
    slug: 'webdev',
    title: 'Web Development',
    metaDescription: 'Developed responsive, visually engaging web pages from UI/UX designs using WordPress, HTML, CSS, JavaScript, and Angular. Each project prioritized use',
    headlineDim: 'Responsive sites',
    headlineRest: ' built for real clients.',
    description: 'Developed responsive, visually engaging web pages from UI/UX designs using WordPress, HTML, CSS, JavaScript, and Angular. Each project prioritized user experience, responsiveness, performance, visual consistency, and client requirements. Some featured clients are showcased below.',
    meta: [
      { label: 'Focus', value: 'Web Development' },
      { label: 'Tools', value: 'WordPress, HTML, CSS, JS, Angular, React' },
      { label: 'Expertise', value: 'Frontend' },
    ],
    cover: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionPortfolio/Web.webp',
    coverAlt: 'Web Development cover',
    carousel: {
      kind: 'strip',
      label: 'Clients',
      durationSeconds: 144,
      items: [
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/rp2.png', alt: 'RP Squared' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/wac.png', alt: 'WAC Arts' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/assurelens.png', alt: 'AssureLens' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/newcon.png', alt: 'Aalco Tech' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/swarmlens.png', alt: 'Swarmlens' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/infill.png', alt: 'Infill' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/rp2.png', alt: 'RP Squared' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/wac.png', alt: 'WAC Arts' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/assurelens.png', alt: 'AssureLens' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/newcon.png', alt: 'Aalco Tech' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/swarmlens.png', alt: 'Swarmlens' },
        { kind: 'static', light: true, hidden: false, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/infill.png', alt: 'Infill' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/rp2.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/wac.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/assurelens.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/newcon.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/swarmlens.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/infill.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/rp2.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/wac.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/assurelens.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/newcon.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/swarmlens.png', alt: '' },
        { kind: 'static', light: true, hidden: true, src: 'https://myportfolio-eosin-delta-45.vercel.app/assets/img/assets/sectionLogos/infill.png', alt: '' },
      ],
    },
    more: [
      { slug: 'webdesign', label: 'Web Design' },
      { slug: 'posterdesign', label: 'Poster Design' },
    ],
  },
];
