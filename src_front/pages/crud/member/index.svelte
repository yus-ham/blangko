<script>
    import { url } from '@roxi/routify';
    import GridView from '~/widgets/grid/GridView.svelte';


    let grid;
    let route = '/crud/member';
</script>

<section>
    <h1>Data Member</h1>

    <GridView bind:this={grid} api-url={route}>
        <div slot="buttons"><a href="{$url(route)}/new">Tambah</a></div>

        <tr slot="columns">
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Birth Date</th>
            <th>...</th>
        </tr>

        <tbody slot="filters">
            <tr>
                <td></td>
                <td><input name="name"></td>
                <td><input name="email"></td>
                <td><input name="phone"></td>
                <td></td>
            </tr>
        </tbody>

        <tr slot="data-row" let:row>
            <td>{row._num}</td>
            <td>{row.name}</td>
            <td>{row.email}</td>
            <td>{row.phone}</td>
            <td>{new Date(row.dob).toString().slice(4, 15)}</td>
            <td>
                <a title="Edit" href="{$url(route)}/{row.id}/edit"><small>[E]</small></a>
                <a title="Delete" data-id="{row.id}" data-method="delete" data-confirm="Are you sure you want to delete this member: `{row.name}`?"><small>[D]</small></a>
            </td>
        </tr>
    </GridView>
</section>
