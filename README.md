# Portfolio (Angular)

A personal portfolio site built with Angular (standalone components, no NgModules).

```bash
npm install     # install dependencies (also run `npm i gsap` if it is missing)
npm start       # run at http://localhost:4200
npm run build   # production build
```

## How the app starts
`index.html` -> `main.ts` -> `AppComponent` (navbar + page + footer) -> the page chosen by `app.routes.ts`.

## Folder map (`src/app`)
| Folder / file | What it is |
|---|---|
| `app.routes.ts` | URL -> page list. Start here to add a page. |
| `app.config.ts` | App-wide settings (router etc.). |
| `app.component.*` | The shell: navbar, `<router-outlet>`, footer. |
| `components/` | Reusable pieces: `navbar`, `footer`, `project-section`. |
| `pages/home` | Home page (hero, work accordion, sections). |
| `pages/about` | ONE folder, ONE component: `.ts` logic, `.html` (header + 7 tiles), `.css`, `about.data.ts` (jobs, skills, stats, tools, clients). |
| `pages/projects` | Project list page. |
| `pages/project` | ONE folder, ONE component for all 4 project pages: `.ts` logic, `.html` layout (hero, carousel, more-work, lightbox), `.css` styles, `project.data.ts` content. |
| `pages/logodesign` | Standalone logo design page version. |
| `pages/mygallary` | WebGL gallery. Image list is in `mygallary.data.ts`. |
| `pages/not-found` | 404 page. |
| `shared/` | Pieces used by several pages (cursor grid canvas). |
| `core/lib/` | Plain TypeScript effects: `page-effects.ts` (fade-in, tickers, eyes), `cursor-grid.ts`, `splash-cursor.ts`. |
| `core/services/` | `momentum-scroll.service.ts` (smooth scrolling on Home). |

## Angular ideas used here (beginner cheat sheet)
- **Component**: a class + HTML + CSS (`@Component`). Its tag name is the `selector`.
- **`imports: [...]`**: a standalone component must list every component/directive its HTML uses.
- **`input()`**: data passed from a parent, e.g. `<app-more-work [links]="...">`. Read it by calling it: `links()`.
- **Service** (`@Injectable`): shared code/state, obtained with `inject(...)`.
- **Signal** (`signal()`): a value that updates the HTML when it changes.
- **Lifecycle**: `ngOnInit` runs when the component starts, `ngAfterViewInit` once its HTML exists, `ngOnDestroy` when it is removed (stop timers/listeners there).
- **`NgZone.runOutsideAngular`**: used for animations so Angular doesn't re-check the UI on every frame.

## Editing content
- Project pages text/images: `pages/project/project.data.ts`
- Home "Work" cards: `pages/home/work/work.data.ts`
- About page lists (jobs, skills, stats, tools, clients): `pages/about/about.data.ts`
- Gallery pictures: `pages/mygallary/mygallary.data.ts`
