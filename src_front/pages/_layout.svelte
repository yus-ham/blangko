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
  body {
    font-family: "Lato";
    font-size: 100%;
    overflow-y: scroll;
    font-family: sans-serif;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  #routify-app {
    height: 100vh;
  }
  main {
    padding-top: 30px;
    padding-left: 50px;
    margin-left: 17em;
  }
</style>
  