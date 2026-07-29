import { preview } from 'vite'

export default async function globalSetup(): Promise<() => Promise<void>> {
  const server = await preview({
    preview: {
      host: '127.0.0.1',
      port: 4174,
      strictPort: true,
    },
    logLevel: 'error',
  })
  return async () => {
    await server.close()
  }
}
