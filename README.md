# Portfolio

My personal developer portfolio with a scroll-driven 3D scene.

**Live:** [angelodevelopment.de](https://angelodevelopment.de)

## Features

- **3D scene with three.js:** a rotating text ring in the hero, a photo cube that flies into the About me section and lands on the photo, and extruded skill icons that fly into the skill grid. All motion follows the scroll position.
- **Background effects:** a water ripple that follows the mouse (on its own WebGL canvas) and a soft cursor glow.
- **English and German:** all texts switch at runtime, the choice is remembered once the toggle is used.
- **Projects:** a list with hover previews and a dialog with details, links and screenshots.
- **Contact form:** validation on blur without layout shift, the submit button only unlocks once everything is valid. Messages are sent through an [n8n](https://n8n.io) webhook, with a honeypot against bots.
- **Imprint and privacy policy** as separate pages without three.js.

### Accessibility and performance

- `prefers-reduced-motion` is respected: 3D objects stay in place, the water effect is off.
- Without WebGL, the page still works. The 3D scene is decorative and hidden from assistive technology.
- three.js is loaded lazily after the page has loaded, fonts are subset to Latin-1, and the scene stops rendering while no 3D object is visible.

## Tech stack

- [Vite](https://vite.dev) (multi-page build)
- [TypeScript](https://www.typescriptlang.org)
- [SCSS](https://sass-lang.com) (BEM, mobile first)
- [three.js](https://threejs.org)
- [n8n](https://n8n.io) for the contact form

## Getting started

```bash
npm install
npm run dev
```

Run `npm run build` to create a production build in `dist/` and `npm run preview` to serve it locally.

## Project structure

```
src/
├── main.ts         # wires up the homepage, no logic of its own
├── legal.ts        # entry for imprint and privacy policy
├── sections/       # one folder per section: SCSS, plus TS if it has behaviour
├── scene/          # everything three.js: stage, flight curves, water
│   └── objects/    # one module per 3D object with createX() and updateX()
├── i18n/           # English and German texts
└── styles/         # tokens, mixins and base styles
n8n/                # export of the contact form workflow
```

Sections know nothing about three.js. `main.ts` passes the elements the scene needs, and the scene reads only their screen positions.

## Deployment

Every push to `main` that changes more than Markdown files or `n8n/` runs the [deploy workflow](.github/workflows/deploy.yml). It can also be started by hand under **Actions**.

1. The workflow builds the site.
2. It copies the build to the server with `rsync` over SSH.
3. [Caddy](https://caddyserver.com) serves the files with HTTPS and redirects `www` to the main domain. It writes no access logs.

Repository secrets (**Settings > Secrets and variables > Actions**):

| Secret | Value |
|---|---|
| `DEPLOY_KEY` | private SSH key of the deploy user |
| `DEPLOY_KNOWN_HOSTS` | output of `ssh-keyscan <server-ip>` |
| `DEPLOY_USER` | user that receives the build |
| `DEPLOY_HOST` | IPv4 address of the server |

The n8n webhook only accepts requests from the portfolio domain and `localhost` (CORS), and Caddy limits webhook requests per IP.
