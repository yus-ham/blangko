module.exports = {
  apps: [
    {
      name: 'blangko-frontend',
      script: 'pnpm run dev',
    },
    {
      name: 'blangko-backend-dev',
      cwd: 'src_api',
      script: 'pnpm run build:watch',
    },
    {
      name: 'blangko-backend-dist',
      cwd: 'src_api',
      script: 'pnpm run start',
      watch: ['dist'],
    },
  ]
}
