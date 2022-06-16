<script>
  import { goto } from '@roxi/routify';
  import { redirectData } from '~/utils/store';
  import Form from './_form.svelte';


  let resource = '/crud/member';

  wretch.addEventListener('success', e => {
    if (e.detail.request.method === 'POST') {
      $redirectData.model = e.detail.response.data;
      $goto(`${e.detail.response.data.id}/edit`)
    }
  })
</script>

<Form title="Add New Member" method="post" action="{api(resource)}">
  <div slot="bottom">
    <a href="{resource}">Back</a>
  </div>
</Form>
