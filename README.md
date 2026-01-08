# Skyhop

Skyhop is a modern, tactile Flappy Bird clone built with vanilla HTML, CSS, and JavaScript. It is a single-page canvas game with no backend and zero build tooling.

## Features

- Responsive canvas playfield with mobile-friendly controls
- Auto-detected desktop/mobile modes with a manual override toggle
- Smooth physics loop and randomized pipe gates
- Local best-score persistence via `localStorage`
- Bold, high-contrast UI with motion accents

## Demo

Open `index.html` directly in a browser. No server required.

## Controls

- Click/tap or press space to flap
- Press `Reset` to restart

## Modes

Skyhop auto-detects desktop vs. mobile based on viewport size and pointer type. Use the mode toggle to force a specific layout and physics profile.

## Project structure

```
.
├── index.html
├── styles.css
├── game.js
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
└── .github/
```

## Deployment (GitHub Pages)

1. Push this folder to a GitHub repository.
2. In GitHub, go to Settings -> Pages.
3. Under Build and deployment, select Branch: `main` and Folder: `/ (root)`.
4. Save. Your site will be available at:

```
https://<username>.github.io/<repo-name>/
```

## Secure-by-default notes

- No secrets or API keys are used.
- No external scripts are loaded (only a Google Font stylesheet).
- Best score is stored locally in the browser.

## Contributing

See `CONTRIBUTING.md` for setup and guidelines.

## Security

See `SECURITY.md` for supported versions and how to report issues.

## License

MIT. See `LICENSE`.
