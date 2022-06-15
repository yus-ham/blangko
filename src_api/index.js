import { serveSession } from '../server';


export default function () {
  return {
    configureServer: vite => {
      vite.middlewares.use(serveSession)
    }
  }
}
