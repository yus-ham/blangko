<script>
  import { Router } from '@roxi/routify';
  import { routes } from '../.routify/routes';

  globalThis.BASE_URL = "$_GLOBAL_BASE_URL";
  globalThis.API_URL = "$_GLOBAL_API_URL";

  const config = {
    urlTransform: {
      apply: u => u.startsWith('/') ? BASE_URL + u : location.pathname + '/../' + u, // for browser
      remove: u => u === BASE_URL ? '/' : u.substr(BASE_URL.length), // for routify
    }
  }
</script>


<svelte:head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no" />
  <link rel="stylesheet" href="{BASE_URL}/css/ionicons.min.css"/>
  <link rel="stylesheet" href="{BASE_URL}/css/pico.min.css"/>
  <title>Blangko | Start business from a blank project</title>
</svelte:head>

<Router {routes} {config} />
