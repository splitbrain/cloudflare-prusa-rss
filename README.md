# Printables.org RSS Feed CloudFlare Worker

This is a simple CloudFlare worker which will query Printable's GraphQL API for my latests 3D model releases and return it as an RSS Feed. When called with /makes it returns my latest makes.

## Notes for myself:

Use `npm install` for the dependencies.

  * `npm run start` spins up a local dev environment
  * `npm run deploy` updates the worker at cloud flare
