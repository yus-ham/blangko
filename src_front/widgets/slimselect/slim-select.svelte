<script>
  import { onMount } from "svelte";
  import SlimSelect from "./slimselect.min.js";
  import wretch from "wretch";

  export let placeholder;
  export let termMin;
  export let name;
  export let url;
  export let map;

  let select;

  const init_slim_select = () => {
    let ss = new SlimSelect({
      select,
      placeholder,
      afterChange(opt) {},
      ajax(term, callback) {
        if (termMin && term.length < termMin) {
          return callback(`Pencarian minimal ${termMin} huruf`);
        }
        const mapper = (item) => ({text: item[map.text], value: item[map.value]});
        const _url = url + (url.indexOf('?') ? '&' : '?') +'term='+ term;
        wretch(_url).get().json(data => callback(data.map(mapper))).catch(err => {});
      },
      afterClose() {
      }
    });
    ss.slim.singleSelected.container.className += ' '+ $$props.class;
  }

  onMount(init_slim_select);
</script>

<style global>
@import "./slimselect.min.css";
.ss-content .ss-list .ss-option {padding:4px 10px}
.ss-single-selected .placeholder * {overflow:visible !important}
.ss-single-selected .placeholder .remove {display:none}
.ss-option-selected {background:#3c8dbc !important}
.ss-disabled {color:#8a8a8a !important}
.ss-main .ss-single-selected {
  border: 1px solid rgba(101,109,119,.24);
  padding: 0.4375rem 0.75rem;
  padding: 0.4375rem 0.75rem;
  height: 36px;
}
.ss-main .ss-single-selected.form-control.is-invalid {
  border-color: #d63939;
}
.ss-main.form-control {
  padding: 0 !important;
  border: none;
  border-radius: unset;
}
</style>

<select bind:this={select} class="{$$props.class}" {placeholder} {name}/>
