<script>
  import { goto } from '@roxi/routify';
  import Form from './_form.svelte';
</script>

<Form title="Tambah User" method="post" action={api('auth/user')} response="{_ => $goto(`${_.id}/edit`)}" />
