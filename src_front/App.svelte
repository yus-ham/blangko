<script>
  import { Router } from '@roxi/routify';
  import { routes } from '../.routify/routes';
  import { routifyConfig as config } from './utils/common.js';

  globalThis.BASE_URL = "$_GLOBAL_BASE_URL";
  globalThis.API_URL = "$_GLOBAL_API_URL";
</script>


<svelte:head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css"/>
  <link rel="stylesheet" href="https://unpkg.com/@picocss/pico@latest/css/pico.min.css"/>
  <title>Blangko | Start business from a blank project</title>
</svelte:head>

<Router {routes} {config} />
