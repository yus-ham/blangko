<script>
    import { urlRewrite } from './utils/common.js';
    import { Router } from '@roxi/routify';
    import routes from '~/../.routify/routes.default.js';

    globalThis.BASE_URL = "$_GLOBAL_BASE_URL";
    globalThis.API_URL = "$_GLOBAL_API_URL";
    globalThis.SESS_API_URL = "$_GLOBAL_SESS_API_URL";
</script>

<svelte:head>
    <link rel="stylesheet" href="{BASE_URL}/css/ionicons.min.css"/>
    <link rel="stylesheet" href="{BASE_URL}/css/pico.min.css"/>
</svelte:head>

<Router {routes} {urlRewrite} />