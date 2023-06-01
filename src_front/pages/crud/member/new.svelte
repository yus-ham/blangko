<script>
    import { goto, url } from "@roxi/routify";
    import { redirectData } from "~/utils/store";
    import Form from "./_form.svelte";

    const route = "/crud/member";

    wretch.addEventListener("success", (e) => {
        if (
            e.detail.request.method === "POST" &&
            e.detail.request.url.includes(route)
        ) {
            $redirectData.model = e.detail.response.data;
            $goto(`${route}/[id]/edit`, {id:e.detail.response.data.id});
        }
    });
</script>

<Form title="Add New Member" method="post" action={api(route)}>
    <div slot="bottom">
        <a href={$url(route)}>Back</a>
    </div>
</Form>
