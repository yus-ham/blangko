<script>
  import { params } from '@roxi/routify';
  import Form from '../_form.svelte';

  let entityPath = '/crud/member'
</script>


{#await api.fetch(`${entityPath}/${$params.id}`)}Loading...{#then respon}
  <Form title="Update Member" model="{respon.data}" method="patch" action="{api(`${entityPath}/${$params.id}`)}">
    <div slot="bottom">
      <a href="{entityPath}">List</a> | <a href="{entityPath}/new">Add New</a>
    </div>
  </Form>
{#endawait}
