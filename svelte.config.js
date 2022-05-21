const globals = [...'onReady,elems,elem,createElem,show,hide,trigger,listen,wretch,api,signInUrl'.split(','), ...Object.keys(globalThis)];


module.exports = {
    disableDependencyReinclusion: ['@roxi/routify'],

    preprocess: [
        require('svelte-preprocess')({
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
                [/{#renderby /gim, '{#key '],
                [/{#endrenderby}/gim, '{/key}'],
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
        else if (warn.message.includes("A11y: '#'"));
        else next(warn)
    },

    copyConfig() {
        let fs = require('fs')
        if (!fs.existsSync('./config.js')) {
            let cfg = fs.readFileSync('./config.js-example', 'utf8')
            fs.writeFileSync('./config.js', cfg, {encoding: 'utf8'})
        }
    }
};
