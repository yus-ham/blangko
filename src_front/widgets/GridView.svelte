<script>
  import { onMount } from 'svelte';
  import { DarkPaginationNav as PagerNav } from 'svelte-paginate';


  let table, spinner, columnLen;

  const list = api.list($$props['api-url']);

  function tableRow(row, i) {
    row._num = $list.paging.offset + i;
    return row;
  }

  onMount(_ => {
    columnLen = table.querySelectorAll('thead tr th').length;

    if (spinner) {
      spinner.setAttribute('initial-load', 1)
    }

    listen(table, 'click', e => {
      const btnDel = e.target.closest('[data-method=delete]')
      if (btnDel) {
        let confirm = true;

        if (btnDel.dataset.confirm) {
          confirm = window.confirm(btnDel.dataset.confirm)
        }

        confirm && wretchAuth(api($$props['api-url']) +'/'+ btnDel.dataset.id)
          .delete()
          .res(_ => {
            $list.load()
          })
      }
    })
  })
</script>

<div>
  <slot class="buttons" name="buttons" /><br>

  <figure>
    <table bind:this="{table}">
      <thead>
        <slot name="columns" />
      </thead>
      <tbody>
        {#each $list.data as row, index}
          <slot data-key="{row.id}" name="data-row" row="{tableRow(row, index)}" />
        {#else}
          <tr><td colspan="{columnLen}"><center><i>No data</i></center></td></tr>
        {#endeach}
      </tbody>
    </table>
  </figure>

  {#if $list.paging?.offset}
    <div>
      <p><i>Showing <span>{$list.paging.offset}</span> to <span>{$list.paging.to}</span> of <span>{$list.paging.totalData}</span></i></p>
    </div>
    <div>
      <PagerNav on:setPage="{e => $list.load(e.detail.page)}" totalItems="{$list.paging.totalData}" pageSize="{$list.paging.perPage}" currentPage="{$list.paging.page}" showStepOptions="1" />
    </div>
  {#endif}

  {#if $list.loading}<div bind:this="{spinner}" aria-busy="true"></div>{#endif}
</div>

<style>
  :global([data-method=delete]) {cursor: pointer}

  div[aria-busy] {
    position: relative;
    height: 50vh;
    top: -70vh;
  }

  :global(div[aria-busy][initial-load]) {top: -15vh}

  div[aria-busy]:before {
    margin-top: 20vh;
    height: 2em;
    width: 2em;
  }
</style>
