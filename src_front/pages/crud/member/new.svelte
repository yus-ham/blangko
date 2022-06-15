<script>
  import { goto } from '@roxi/routify';
  import { redirectData } from '~/utils/store';
  import Form from './_form.svelte';


  let entityPath = '/crud/member'

  wretch.addEventListener('success', e => {
    if (e.detail.request.method === 'POST') {
      $redirectData.model = e.detail.response.data;
      $goto(`${e.detail.response.data.id}/edit`)
    }
  })
</script>

<Form title="Add New Member" method="post" action="{api(entityPath)}">
  <div slot="bottom">
    <a href="{entityPath}">Back</a>
  </div>
</Form>
