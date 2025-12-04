<script lang="ts">
	import { onMount } from "svelte";

    let datasets = $state([]);

    onMount(async () => {
        let access_token = localStorage.getItem('access_token');

        const response = await fetch('https://dmz-web-169.ipk-gatersleben.de/rest/extendedSearch/drillDown', {
            method: 'POST'
        });
        datasets = await response.json();
    })
</script>

<pre>
    {JSON.stringify(datasets, null, 2)}
</pre>

