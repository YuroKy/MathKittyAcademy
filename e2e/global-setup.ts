import { createServer } from 'vite'

export default async function globalSetup(): Promise<() => Promise<void>> {
  process.env.VITE_E2E = 'true'

  const server = await createServer({
    server: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
    logLevel: 'error',
  })

  await server.listen()

  return async () => {
    await server.close()
  }
}
