<script>
  import { params } from '@roxi/routify';
  export let slug;

  console.error('Local param in <script>: ', slug)
</script>

{ console.error('Local param in markup:', slug) } <!-- trigger calls to this page before leaving to parent page -->
{ console.error('Global param in markup:', $params.slug) }

<a href="/crud/page-runs-while-leaving/blogs">Back to /articles</a><br>
