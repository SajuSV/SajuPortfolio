// GSAP SETUP: GSAP is an animation library. We register its ScrollTrigger plugin
// (animations driven by scrolling) once here, and the rest of the app imports from this file.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
