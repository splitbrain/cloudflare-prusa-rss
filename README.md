# PrusaPrinters RSS Feed CloudFlare Worker

This is a simple CloudFlare worker which will query PrusaPrinter's GraphQL API for my latests 3D model releases and return it as an RSS Feed.

## Notes for myself:

Use `npm install` for the dependencies.

Use [wrangler](https://github.com/cloudflare/wrangler)

  * `wrangler dev` spins up a local(?) dev environment
  * `wrangler publish` updates the worker
