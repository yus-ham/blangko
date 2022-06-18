import { serveSession } from './app';


export default function () {
  return {
    configureServer: vite => {
      vite.middlewares.use(serveSession)
    }
  }
}
