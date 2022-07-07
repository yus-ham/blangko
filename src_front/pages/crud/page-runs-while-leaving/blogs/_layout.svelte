<script>
  import { beforeUrlChange, afterPageLoad } from '@roxi/routify';

  $beforeUrlChange((event, route) => {
    console.log('=======================================')
    console.log('Current page: url = ', event.url.replace('/crud/page-runs-while-leaving', ''))
    return true
  })

  $afterPageLoad(_ => {
    // console.log('afterPageLoad: url = '+ location.href.replace('http://localhost:3000/crud/page-runs-while-leaving', ''))
  })
</script>

<slot/>
