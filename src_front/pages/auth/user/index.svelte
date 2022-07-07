<script>
  // import { afterClick } from '../../../utils/common';
  import GridView from '~/widgets/GridView.svelte';

  let grid;
</script>

<div class="ant-card ant-card-bordered">
  <div class="ant-card-head">
    <h1 class="ant-card-head-title mb-0">User</h1>
  </div>
  <div class="ant-card-body">
    <GridView url="auth/user" bind:this="{grid}">
      <div slot="buttons"><a class="btn btn-primary" href="user/new">Tambah</a></div>

      <tr slot="columns">
        <th>#</th>
        <th>Nama Lengkap</th>
        <th>Username</th>
        <th>Role</th>
        <th class="text-center">...</th>
      </tr>

      <tr slot="data-row" let:row>
        <td>{ row._num }</td>
        <td>{ row.name }</td>
        <td>{ row.username }</td>
        <td>{ row.role }</td>
        <td class="action-btns">
          <!-- <a title="Lihat" class="btn btn-xs btn-info" href="user/{row.id}/view"><i class="fa fa-eye"></i></a> -->
          <!-- <a title="Ubah" class="btn btn-xs btn-warning modal-toggle modal-form" href="{api('auth/user/'+ row.id)}" form="form.d-none" form-method="patch"><i class="fa fa-edit"></i></a> -->
          <a title="Ubah" class="btn btn-xs btn-warning" href="user/{row.id}/edit"><i class="fa fa-edit"></i></a>
          <!-- <a title="Hapus" class="btn btn-xs btn-danger" api-url="{'auth/user/' + row.id}" data-method="delete" data-confirm="Apakah anda yakin menghapus data user `{row.name}`?" on:click="{afterClick(grid.reload)}"><i class="fa fa-trash"></i></a> -->
        </td>
      </tr>
    </GridView>
  </div>
</div>
