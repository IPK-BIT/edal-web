<script lang="ts">
	import { onMount } from "svelte";

    let datasets = $state([]);

    onMount(async () => {
        let access_token = localStorage.getItem('access_token');

        const response = await fetch('https://dmz-web-169.ipk-gatersleben.de/submission/access/datasets', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        datasets = await response.json();
    })
</script>

<pre>
{JSON.stringify(datasets, null, 2)}
</pre>

