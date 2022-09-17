<script>
  import { session } from '~/utils/store.js';
  import { getSession, authenticate } from '~/utils/common.js';
  import Sidebar from './_layout/sidebar.svelte';
</script>

{#await getSession()}
  <h1 style="margin-top:50vh; text-align:center">Loading App...</h1>
{#then sess}
  {#if $session || authenticate(sess)}
      <Sidebar/>
      <main>
          <slot/>
      </main>
  {#endif}
{#endawait}

<style global>
  #routify-app {height: 100vh;}
  main {padding: 0  15px;}
</style>
  