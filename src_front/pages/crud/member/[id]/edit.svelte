<script>
  import { redirectData } from '~/utils/store';
  import { params } from '@roxi/routify';
  import Form from '../_form.svelte';
  import NotFounPage from '~/pages/_fallback.svelte';


  let resource = '/crud/member';

  const getModel = () => $redirectData.model
                 ? {data: $redirectData.model}
                 : api.fetch(`${resourcr}/${$params.id}`)
</script>


{#await getModel()}Loading...{#then respon}
  <Form title="Update Member" model="{respon.data}" method="patch" action="{api(`${resource}/${$params.id}`)}">
    <div slot="bottom">
      <a href="{resource}">List</a> | <a href="{resource}/new">Add New</a>
    </div>
  </Form>
{#catch err}
  {#if err.response.status === 404} <NotFounPage />
  {#else} {console.error(err)||''}
  {#endif}
{#endawait}
