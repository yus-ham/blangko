<script>
  import { getSession } from '~/utils/common.js';
  import { session, redirectData } from '~/utils/store.js';
  import { goto } from '@roxi/routify';
</script>


{#if $session === undefined}
  <!-- redirected from elsewhere -->
  <slot />
{#else} <!-- no referer -->
  {#await getSession()}
    <h1 style="margin-top:50vh; text-align:center">Loading App...</h1>
  {#then sess}
    {#if sess.status === 401}
      <slot />
    {#else}
      {$goto($redirectData.prevUrl || '/') ||''}
    {#endif}
  {#endawait}
{#endif}
