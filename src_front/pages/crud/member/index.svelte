<script>
  import { onMount } from 'svelte';
  import GridView from '~/widgets/GridView.svelte';


  let grid;
  let entityPath = '/crud/member'

  // const {initialize} = createForm('[data-method=delete]', {

  // });
console.info({GridView})

  onMount(_ => {
    // initialize($$props.model);


    // })
  });
</script>

<section>
  <h1>Data Member</h1>

  <GridView api-url="{entityPath}" bind:this="{grid}">
      <div slot="buttons"><a href="{entityPath}/new">Tambah</a></div>

      <tr slot="columns">
        <th>#</th>
        <th>Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Birth Date</th>
        <th>...</th>
      </tr>

      <tr slot="data-row" let:row>
        <td>{row._num}</td>
        <td>{row.name}</td>
        <td>{row.email}</td>
        <td>{row.phone}</td>
        <td>{new Date(row.dateOfBirth).toString().slice(4, 15)}</td>
        <td>
          <a title="Edit" href="{entityPath}/{row.id}/edit"><small>[E]</small></a>
          <a title="Delete" data-id="{row.id}" data-method="delete" data-confirm="Are you sure you want to delete this member: `{row.name}`?"><small>[D]</small></a>
        </td>
      </tr>
  </GridView>
</section>
