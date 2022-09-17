import preProcess from 'svelte-preprocess';


const globals = [...'onReady,elems,elem,createElem,show,hide,trigger,listen,wretch,api,signInUrl'.split(','), ...Object.keys(globalThis)];


export default {
    preprocess: [
        preProcess({
            replace: [
                [/{#else if /gim, '{:else if '],
                [/{#elseif /gim, '{:else if '],
                [/{#else}/gim, '{:else}'],
                [/{#endif}/gim, '{/if}'],
                [/{#endeach}/gim, '{/each}'],
                [/{#then /gim, '{:then '],
                [/{#catch /gim, '{:catch '],
                [/{#endawait}/gim, '{/await}'],
                [/{#endkey}/gim, '{/key}'],
                [/{#depend /gim, '{#key '],
                [/{#enddepend}/gim, '{/key}'],
                [/{#endepend}/gim, '{/key}'],
                [/{#debug /gim, '{@debug '],
                [/{#html /gim, '{@html '],

                ['$_GLOBAL_BASE_URL', String(globalThis.BASE_URL||'').replace(/\/+$/, '')],
                ['$_GLOBAL_API_URL', globalThis.API_URL],
            ]
        }),
    ],

    onwarn(warn, next) {
        // skip warnings
        if (warn.code === 'missing-declaration' && globals.includes(warn.message.split("'")[1]));
        else next(warn)
    },
}
