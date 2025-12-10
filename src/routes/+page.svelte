<script>
	import { goto } from '$app/navigation';
	import logo from '$lib/assets/favicon.png';
	import { generateCodeChallenge, generateCodeVerifier, performLogin } from '$lib/js/oidc';

	async function login() {
		let verifier = generateCodeVerifier();
		localStorage.setItem('code_verifier', verifier);
		let challenge = await generateCodeChallenge(verifier);
		performLogin(challenge);
	}
	
</script>

<section class="mx-auto my-9 max-w-5xl p-6">
	<header class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-3">
			<img
				src={logo}
				alt="e!DAL logo"
				class="block h-12 w-12 rounded-lg object-contain object-center shadow-md"
			/>

			<div>
				<h1 class="text-lg font-semibold">e!DAL — Plant Genomics & Phenomics</h1>
				<p class="text-sm text-neutral">
					Research data repository for large, heterogeneous plant genomics and phenomics datasets.
				</p>
			</div>
		</div>
	</header>

	<main class="mt-7 flex items-stretch gap-7">
		<div class="flex-1">
			<h2 class="text-2xl font-bold">
				Publish large plant genomics & phenomics datasets with persistent DOIs
			</h2>
			<p class="text-justify text-neutral">
				e!DAL-PGP as infrastructure to comprehensively publish plant research data. This covers in
				particular cross-domain datasets that are not being published in central repositories
				because of its volume or unsupported data scope, like image collections from plant
				phenotyping and microscopy, unfinished genomes, genotyping data, visualizations of
				morphological plant models, data from mass spectrometry as well as software and documents.
			</p>

			<div class="my-4 flex gap-3">
				<a class="btn btn-primary" target="_blank" href="https://ipk-bit.github.io/edal-pgp-knowledgebase">Quick Tour</a>
			</div>

			<ul class="grid gap-2 text-neutral">
				<li><strong>LS Login</strong> — institutional authentication and access control</li>
				<li><strong>Large & heterogeneous data</strong> — handle genomes, images and more</li>
				<li><strong>Rich metadata</strong> — apply community schemas for discoverability</li>
				<li>
					<strong>DOI publication</strong> — mint persistent identifiers and publish archival copies
				</li>
			</ul>
		</div>

		<div class="w-96" aria-hidden="true">
			<div class="card rounded-lg bg-base-100 p-4 shadow">
				<div class="mb-3 flex items-center justify-between">
					<div>
						<strong>Statistics</strong>
					</div>
					<div class="flex items-center gap-2 text-sm">
						<span class="h-2 w-2 rounded-full bg-primary shadow-sm"></span> online
					</div>
				</div>
				<div class="stats stats-vertical text-neutral">
					<div class="stat">
						<div class="stat-title">Datasets published</div>
						<div class="stat-value">327</div>
					</div>

					<div class="stat">
						<div class="stat-title">Data volume</div>
						<div class="stat-value">3.2 PB</div>
					</div>

					<div class="stat">
						<div class="stat-title">Distinct download IPs</div>
						<div class="stat-value">692,760</div>
					</div>
				</div>
			</div>
		</div>
	</main>

	<section id="get-started" class="mt-7">
		<h3 class="mb-3 text-lg font-semibold">How it works</h3>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			<button onclick={login} class="card rounded-lg bg-base-100 p-4 shadow text-left hover:shadow-lg hover:cursor-pointer">
				<div
					class="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-bold text-secondary-content"
				>
					1
				</div>
				<h4 class="font-semibold">Authenticate</h4>
				<p class="text-sm text-base-content opacity-70">
					Sign in using LS Login for secure, trusted access control.
				</p>
			</button>

			<button onclick={()=>goto("/submit")} class="card rounded-lg bg-base-100 p-4 shadow text-left hover:shadow-lg hover:cursor-pointer">
				<div
					class="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-bold text-secondary-content"
				>
					2
				</div>
				<h4 class="font-semibold">Publish</h4>
				<p class="text-sm text-base-content opacity-70">
					Upload your dataset, provide rich metadata, and prepare it for publication.
				</p>
			</button>

			<button onclick={()=>goto("/search")} class="card rounded-lg bg-base-100 p-4 shadow text-left hover:shadow-lg hover:cursor-pointer">
				<div
					class="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-bold text-secondary-content"
				>
					3
				</div>
				<h4 class="font-semibold">Reuse</h4>
				<p class="text-sm text-base-content opacity-70">
					Your dataset is assigned a DOI and publicly accessible for the research community.
				</p>
			</button>
		</div>
	</section>
</section>

