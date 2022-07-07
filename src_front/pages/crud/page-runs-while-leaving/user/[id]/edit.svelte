<script>
  export let id;
  
  function log(x) { console.error('log in markup',x); return ''}
  
  console.log('enter page: /user/1/edit')
</script>

{log(id)} <!-- referencing `id` in markup triggers calls this page before leaving to upper page -->


<a href="/crud/page-runs-while-leaving/user">Go to /user</a><br>
<a href="/crud/page-runs-while-leaving/user/1/new">Go to /user/1/new</a><br>
<a href="/crud/page-runs-while-leaving/user/view">Go to /user/view</a><br>
