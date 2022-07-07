<script>
  import GridView from '~/widgets/GridView.svelte';

  let grid;
</script>
  
<div class="ant-card ant-card-bordered">
  <div class="ant-card-head">
    <h1 class="ant-card-head-title mb-0">Role</h1>
  </div>

  <div class="ant-card-body">
    <GridView url="auth/role" bind:this="{grid}">
      <div slot="buttons"><a class="btn btn-primary" href="role/new">Tambah</a></div>

      <tr slot="columns">
        <th>#</th>
        <th>Role</th>
        <th class="text-center">...</th>
      </tr>

      <tr slot="data-row" let:row>
        <td>{ row._num }</td>
        <td>{ row.name }</td>
        <td class="action-btns">
          <a title="Ubah" class="btn btn-xs btn-warning" href="role/{row.id}/edit"><i class="fa fa-edit"></i></a>
          <!-- <a title="Hapus" class="btn btn-xs btn-danger" api-url="{'auth/role/' + row.id}" data-method="delete" data-confirm="Apakah anda yakin menghapus data role `{row.name}`?" on:click="{afterClick(grid.reload)}"><i class="fa fa-trash"></i></a> -->
        </td>
      </tr>
    </GridView>
  </div>
</div>
