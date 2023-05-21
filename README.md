# Blangko
<i>Start business from a blank project.</i>

This is SPA starter based on [Svelte](https://svelte.dev) + [Routify](https://routify.dev).


### Installation
Clone and select a branch as of your prefered backend.

```
git clone https://github.com/yus-ham/blangko.git --depth 1 --single-branch -b api-bun-serve <PROJECT_NAME>
cd <PROJECT_NAME>

cp .env.sample .env
bunx knex --knexfile ./src_api/knexfile.cjs migrate:latest 

bun install
bun run build
bun run start
```


### Demo User
> username: admin<br> password: 123456789


### Development
```
bun run dev
```
