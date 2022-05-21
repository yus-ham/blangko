<script>
  import { onMount } from 'svelte';
  import createForm from '~/utils/form.js';


  const formId = 'form';
  const {submitting, initialize} = createForm(formId, {
    success: _ => alert(`Data saved`),
  });

  onMount(async _ => {
    initialize($$props.model);
  });
</script>

<div>
  <div>
    <h1>{$$props.title}</h1>
  </div>
  <div>

    <form id="{formId}" method="{$$props.method}" action="{$$props.action}">

      <div>
        <label>Name</label>
        <div>
          <input name="name"/>
          <div/>
        </div>
      </div>

      <div>
        <label>Email</label>
        <div>
          <input name="email"/>
          <div/>
        </div>
      </div>

      <div>
        <label>Phone</label>
        <div>
          <input name="phone" maxlength="12"/>
          <div/>
        </div>
      </div>

      <div>
        <label>Birth Date</label>
        <div>
          <input name="dateOfBirth" type="date" />
          <div/>
        </div>
      </div>

      <div>
        <div>
          <button type="submit" aria-busy="{$submitting}">Save</button>
        </div>
      </div>

      <slot name="bottom"/>
    </form>

  </div>
</div>
