<script>
  export let id;
  
  function log(x) { console.error('log in markup',x); return ''}
  
  console.log('enter page: /user/1/new')
</script>

<!-- {log(id)} referencing `id` in markup triggers calls this page before leaving -->


<a href="/crud/page-runs-while-leaving/user">Go to /user</a>
