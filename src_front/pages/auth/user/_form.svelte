<script>
  import { onMount } from 'svelte';
  import { url } from '@roxi/routify';
  import processor from '../../../utils/form';

  let formId = 'form';

  const {isSubmitting, initialize} = processor(formId, {
    response: async data => {
      let result = await swal_success(`Data berhasil disimpan`);
      $$props.response && $$props.response(data);
    },
  });

  let roles = [];
  roles.length || api.data('auth/role').then(data => roles = data);

  onMount(async _ => {
    initialize($$props.model);
  });
</script>

<div class="ant-card ant-card-bordered">
  <div class="ant-card-head">
    <h1 class="ant-card-head-title mb-0">{$$props.title}</h1>
  </div>
  <div class="ant-card-body">

    <form class="" id="{formId}" method="{$$props.method}" action="{$$props.action}">
      <div class="row mb-2">
        <label class="col-form-label col-sm-3">Nama Lengkap</label>
        <div class="col-sm-8">
          <input name="name" class="form-control" />
          <div class="text-start" />
        </div>
      </div>
      <div class="row mb-2">
        <label class="col-form-label col-sm-3">Username</label>
        <div class="col-sm-8">
          <input name="username" class="form-control" />
          <div class="hint text-start" />
        </div>
      </div>
      <div class="row mb-2">
        <label class="col-form-label col-sm-3">Email</label>
        <div class="col-sm-8">
          <input name="email" class="form-control" />
          <div class="hint text-start" />
        </div>
      </div>
      <div class="row mb-2">
        <label class="col-form-label col-sm-3">Role</label>
        <div class="col-sm-8">
          <select name="role_id" class="form-control">
            <option value=""> -- Pilih Role -- </option>
            {#each roles as role}
              <option value="{role.id}" selected="{role.id == $$props.model?.role_id}">{role.name}</option>
            {#endeach}
          </select>
          <div class="hint text-start" />
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-sm-8 offset-sm-3">
          <button class="btn btn-primary" type="submit">Simpan{#if $isSubmitting}&nbsp; <i class="spinner-border spinner-border-sm"></i>{#endif}</button>
          <a class="btn btn-secondary" href={$url('/auth/user')}>Kembali</a>
        </div>
      </div>
    </form>

  </div>
</div>
