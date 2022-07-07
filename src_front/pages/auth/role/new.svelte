<script>
  import { goto } from '@roxi/routify';
  import Form from './_form.svelte';
</script>

<Form title="Tambah Role" method="post" action="{api('auth/role')}" response="{_ => $goto(`${_.id}/edit`)}" />
