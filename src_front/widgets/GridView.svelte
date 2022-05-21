<script>
  import { onMount } from 'svelte';
  import { DarkPaginationNav as PagerNav } from 'svelte-paginate';


  let table;
  let columnLen;
  let renderTime = Date.now();

  const list = api.list($$props['api-url']);

  function tableRow(row, i) {
    row._num = $list.paging.offset + i;
    return row;
  }

  onMount(_ => {
    columnLen = table.querySelectorAll('thead tr th').length;

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
    <table bind:this={table}>
      <thead>
        <slot name="columns" />
      </thead>
      <tbody>
        {#renderby renderTime}
          {#each $list.data as row, index}
            <slot data-key="{row.id}" name="data-row" row="{tableRow(row, index)}" />
          {#else}
            {#if $list.loading}
              <tr>
                <td colspan="{columnLen}">
                  <center>
                    <span aria-busy="true"></span><br>
                    <i>Sedang memuat data</i>
                  </center>
                </td>
              </tr>
            {#else}
              <tr><td colspan="{columnLen}"><center><i>Tidak ada data</i></center></td></tr>
            {#endif}
          {#endeach}
        {#endrenderby}
      </tbody>
    </table>
  </figure>


  <div>
  {#if $list.paging.offset}
    <div>
      <p><i>Menampilkan <span>{$list.paging.offset}</span> s/d <span>{$list.paging.to}</span> dari <span>{$list.paging.totalData}</span></i></p>
    </div>
    <div>
      <PagerNav on:setPage="{e => $list.load(e.detail.page)}" totalItems="{$list.paging.totalData}" pageSize="{$list.paging.perPage}" currentPage="{$list.paging.page}" showStepOptions="1" limit="2" />
    </div>
  {#endif}
  </div>
</div>

<style global>
  [data-method=delete] {cursor: pointer}
</style>
