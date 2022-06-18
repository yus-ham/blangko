# Blangko
<i>Start business from a blank project.</i>

This is SPA starter based on [Svelte](https://svelte.dev) + [Routify](https://routify.dev).


### Installation
Clone and select a branch as of your preferd backend.

```
git clone https://github.com/yus-ham/blangko.git --depth 1 --single-branch -b api-yii2 <PROJECT_NAME>
```
#### Backend API Installation
```
cd <PROJECT_NAME>/src_api
composer install
php yii install
php yii migrate
php yii serve
```


#### Frontend Installation
Open new terminal and run
```
cd /path/to/your/<PROJECT_NAME>
pnpm install
pnpm build
pnpm start
```


### Demo User
> username: admin<br> password: 123456789


### Development
```
pnpm dev
```
