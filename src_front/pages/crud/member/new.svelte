<script>
    import { goto, url } from "@roxi/routify";
    import { redirectData } from "~/utils/store";
    import Form from "./_form.svelte";


    const route = "/crud/member";

    function onSuccess({detail: model}) {
        $redirectData.model = model;
        $goto(`${route}/[id]/edit`, {id: model.id})
    }
</script>

<Form title="Add New Member" action={api(route)} on:success={onSuccess}>
    <div slot="bottom">
        <a href={$url(route)}>Back</a>
    </div>
</Form>
