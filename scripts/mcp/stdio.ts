import { serveStdio } from '@modelcontextprotocol/server/stdio'
import { createSiteCheckServer } from './server'

// stdout is the protocol channel: everything else must go to stderr.
console.log = console.error

serveStdio(() => createSiteCheckServer(), {
  onerror: (error) => console.error('[site-check]', error),
})
