<script>
  import { params } from '@roxi/routify';
  import Form from '../_form.svelte';
</script>

{#await api.fetch('auth/user/' + $params.id)}Loading...{#then respon}
  <Form title="Edit User" model="{respon.data}" method="patch" action="{api('auth/user/') + $params.id}" />
{#endawait}
