<script>
    import { goto } from "@roxi/routify";
    import { redirectData } from "~/utils/store";
    import Form from "./_form.svelte";

    const resource = "/crud/member";

    wretch.addEventListener("success", (e) => {
        if (
            e.detail.request.method === "POST" &&
            e.detail.request.url.includes(resource)
        ) {
            $redirectData.model = e.detail.response.data;
            $goto(`${resource}/[id]/edit`, {id:e.detail.response.data.id});
        }
    });
</script>

<Form title="Add New Member" method="post" action={api(resource)}>
    <div slot="bottom">
        <a href={resource}>Back</a>
    </div>
</Form>
