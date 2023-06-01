<script>
    const className = `form-check-input`

    let cb_input;

    function toggleSelections(e) {
        cb_input.closest('table').querySelectorAll(`tbody .${className}`).forEach(el => el.checked = e.target.checked)
    }

    function isAllChecked() {
        return cb_input && [...cb_input.closest('table').querySelectorAll(`tbody .${className}`)].filter(el => el.checked).length === $$props['row-count']
    }
</script>

{#if $$props['row-count']}
    <input bind:this={cb_input} class={className} type="checkbox" on:change={toggleSelections} checked={isAllChecked()} />
{#else}
    <input class={className} type="checkbox" value={$$props.value} />
{#endif}
