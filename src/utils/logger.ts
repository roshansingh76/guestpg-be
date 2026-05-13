export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.info(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message, meta: meta || {} }))
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), message, meta: meta || {} }))
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), message, meta: meta || {} }))
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    console.debug(JSON.stringify({ level: 'debug', timestamp: new Date().toISOString(), message, meta: meta || {} }))
  },
}
