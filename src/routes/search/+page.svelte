<script lang="ts">
	import { onMount } from "svelte";

    let datasets = $state([]);

    onMount(async () => {
        const response = await fetch('https://dmz-web-169.ipk-gatersleben.de/submission/access/datasets', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ5ckZ5QlVzd0tvakxiT1d2T3J3VTJvc2h5ZGZCVHZ3TVdZVktqb2xMU1dFIn0.eyJleHAiOjE3NjQxNjAyNzIsImlhdCI6MTc2NDE1ODQ3MiwiYXV0aF90aW1lIjoxNzY0MTU4NDcwLCJqdGkiOiJmMWNlOWMyZS0zNTgzLTQ4MGUtOTQ2My1hYTBmMzc3OTY1NmUiLCJpc3MiOiJodHRwOi8vZGV2LnNjb3JwaW9uLmJpLmRlbmJpLmRlL3JlYWxtcy9zY29ycGlvbiIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJhOWZjMGZhYy1jMTI5LTQ3MWItOTgyNy04MGQ0Yjc5OTA0NTMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJkZW5iaSIsInNlc3Npb25fc3RhdGUiOiI3NTQ3MmUyNC1lN2RhLTRmMTktYTMxNi03OGZkNWZhN2RjZTciLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIioiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iLCJkZWZhdWx0LXJvbGVzLXNjb3JwaW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiZGVuYmkiOnsicm9sZXMiOlsiaXBrIiwiYWRtaW4iXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIGVtYWlsIHByb2ZpbGUiLCJzaWQiOiI3NTQ3MmUyNC1lN2RhLTRmMTktYTMxNi03OGZkNWZhN2RjZTciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6Ik1hbnVlbCBGZXNlciIsInByZWZlcnJlZF91c2VybmFtZSI6ImZlc2VybSIsImdpdmVuX25hbWUiOiJNYW51ZWwiLCJmYW1pbHlfbmFtZSI6IkZlc2VyIiwiZW1haWwiOiJmZXNlckBpcGstZ2F0ZXJzbGViZW4uZGUifQ.Ow1d8SJQeo30CaNocooFaOA8ndrkrgaHZqgGfHTl6MMJL858DH3XZT6--XlNS8nUQxmoTq4rRq9CuuK1fBuJVWCbd69qSaQZWPna9qyo07CuSBMdRo404pLaut08oJVhUZ7ZqKf6fMxS7W8ZHxyr19IWwf6IFf6POUaYmgEBBgPZx9_dGsr7B6-VupraT5PdZMp-S9EYQ95BrOUP5rJgh1y-7GP1XyI4yPE9tQeyeTyhz24ujMCJhDeNpQJdSlyQM5tIV0ph6xaqnZshumZ7828hcDUySDrFYLtpn2kl_qZ1HZIRwStfjKHs2MXrmIoZu43KYq9YVgeY51VoODZmeg'
            }
        });
        datasets = await response.json();
    })
</script>

<pre>
{JSON.stringify(datasets, null, 2)}
</pre>

