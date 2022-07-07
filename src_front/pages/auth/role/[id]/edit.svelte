<script>
  import { params } from '@roxi/routify';
  import Form from '../_form.svelte';
</script>

{#await api.fetch('auth/role/' + $params.id)}Loading...{#then respon}
  <Form title="Edit Role" model="{respon.data}" method="patch" action="{api('auth/role/') + $params.id}" />
{#endawait}
