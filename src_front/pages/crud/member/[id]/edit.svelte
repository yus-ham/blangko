<script>
    import { redirectData } from '~/utils/store';
    import { url, params } from '@roxi/routify';
    import Form from '../_form.svelte';
    import NotFounPage from '~/pages/_fallback.svelte';


    let route = '/crud/member';

    const getModel = () => $redirectData.model
               ? {data: $redirectData.model}
               : api.fetch(`${route}/${$params.id}`)
</script>


{#await getModel()}Loading...{#then respon}
    <Form title="Update Member" model="{respon.data}" method="patch" action="{api(`${route}/${$params.id}`)}">
        <div slot="bottom">
            <a href="{$url(route)}">List</a> | <a href="{$url(route)}/new">Add New</a>
        </div>
    </Form>
{#catch err}
    {#if err.response.status === 404} <NotFounPage />
    {#else} {console.error(err)||''}{#endif}
{#endawait}