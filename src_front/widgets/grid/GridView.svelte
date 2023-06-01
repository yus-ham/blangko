<script>
    import { onMount } from 'svelte';
    import { DarkPaginationNav as PagerNav } from 'svelte-paginate';


    let table, spinner, columnLen, data = [];

    export const collections = {}

    const list = api.list($$props['api-url'])

    list.subscribe(respon => {
        if (!respon.loading) {
            if ($$props['collection']) {
                data = respon.data[ $$props['collection'] ]

                for (const prop in respon.data) {
                    collections[prop] = respon.data[prop]                    
                }
            }
            else data = respon.data ||[]
        }
    })

    function tableRow(row, i) {
        row._num = $list.paging.offset + i;
        return row;
    }

    export function applyFilter(input, value) {
        const inputs = input.closest('[slot=filters]').querySelectorAll('input, select')
        $list.load(1, [...inputs].map(el => {
            return (value && el.name === input.name)
                ? `${el.name}=${value}`
                : `${el.name}=${el.value}`
        }).join('&'))
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
                                .then(req => req.delete().res(_ => $list.load()))
            }
        })

        listen(table, 'keydown', e => {
            if (e.target.nodeName !== 'INPUT') return
            if (e.code !== 'Enter') return
            applyFilter(e.target)
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
            <slot name="filters" />
            <tbody>
            {#each data as row, index}
                <slot data-key={row.id} name="data-row" row={tableRow(row, index)} />
            {#else}
                <tr><td colspan={columnLen}><center><i>No data</i></center></td></tr>
            {#endeach}
            </tbody>
        </table>
    </figure>

    {#if $list.paging?.offset}
    <div>
        <p><i>Showing <span>{$list.paging.offset}</span> to <span>{$list.paging.to}</span> of <span>{$list.paging.totalData}</span></i></p>
    </div>
    <div>
        <PagerNav on:setPage={e => $list.load(e.detail.page)} totalItems={$list.paging.totalData} pageSize={$list.paging.perPage} currentPage={$list.paging.page} showStepOptions="1" />
    </div>
    {#endif}

    {#if $list.loading}<div bind:this={spinner} aria-busy="true"></div>{#endif}
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
