# Printables.org RSS Feed CloudFlare Worker

This is a simple CloudFlare worker which will query Printable's GraphQL API for my latests 3D model releases and return it as an RSS Feed. When called with /makes it returns my latest makes.

If you want to use it yourself, clone the repo and change the `USER` variable in `src/index.js` to match your user ID, then deploy it as a cloudflare worker.

## Notes for myself:

Use `npm install` for the dependencies.

  * `npm run start` spins up a local dev environment
  * `npm run deploy` updates the worker at cloud flare
