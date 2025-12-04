<script>
	import logo from '$lib/assets/favicon.png';
	
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
				<p class="text-sm text-slate-500">
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
			<p class="text-justify text-slate-600">
				e!DAL-PGP as infrastructure to comprehensively publish plant research data. This covers in
				particular cross-domain datasets that are not being published in central repositories
				because of its volume or unsupported data scope, like image collections from plant
				phenotyping and microscopy, unfinished genomes, genotyping data, visualizations of
				morphological plant models, data from mass spectrometry as well as software and documents.
			</p>

			<div class="my-4 flex gap-3">
				<a class="btn btn-primary" target="_blank" href="https://ipk-bit.github.io/edal-pgp-knowledgebase">Quick Tour</a>
			</div>

			<ul class="grid gap-2 text-slate-700">
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
						<strong>Quick demo</strong>
						<div class="text-sm text-slate-500">No keys are uploaded — everything runs locally</div>
					</div>
					<div class="flex items-center gap-2 text-sm">
						<span class="h-2 w-2 rounded-full bg-emerald-500 shadow-sm"></span> local
					</div>
				</div>

				<div>
					<div class="flex gap-3">
						<div class="flex flex-1 items-center gap-3 rounded-lg bg-base-100 p-3 shadow-inner">
							<div>
								<div class="font-semibold">Upload</div>
								<div class="text-sm text-slate-500">Add files and dataset assets</div>
							</div>
						</div>

						<div class="flex flex-1 items-center gap-3 rounded-lg bg-base-100 p-3 shadow-inner">
							<div>
								<div class="font-semibold">Annotate</div>
								<div class="text-sm text-slate-500">Describe using community metadata schemas</div>
							</div>
						</div>
					</div>

					<div class="mt-3">
						<div class="rounded-lg bg-base-100 p-3">
							<div class="text-sm text-slate-500">Sample DOI</div>
							<pre
								class="mt-2 rounded bg-slate-900 p-2 font-mono text-sm whitespace-pre-wrap text-sky-100">doi:10.12345/edal.sampledataset</pre>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>

	<section id="get-started" class="mt-7">
		<h3 class="mb-3 text-lg font-semibold">How it works</h3>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			<article class="card rounded-lg bg-base-100 p-4 shadow">
				<div
					class="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-bold text-secondary-content"
				>
					1
				</div>
				<h4 class="font-semibold">Authenticate (LS Login)</h4>
				<p class="text-sm text-base-content opacity-70">
					Sign in using institutional LS Login for secure, trusted access control.
				</p>
			</article>

			<article class="card rounded-lg bg-base-100 p-4 shadow">
				<div
					class="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-bold text-secondary-content"
				>
					2
				</div>
				<h4 class="font-semibold">Describe & validate</h4>
				<p class="text-sm text-base-content opacity-70">
					Upload files and annotate them with metadata using community schemas (genomics, phenomics,
					etc.).
				</p>
			</article>

			<article class="card rounded-lg bg-base-100 p-4 shadow">
				<div
					class="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary font-bold text-secondary-content"
				>
					3
				</div>
				<h4 class="font-semibold">Publish with DOI</h4>
				<p class="text-sm text-base-content opacity-70">
					Mint a DOI, deposit archival copies, and make your dataset citable and discoverable.
				</p>
			</article>
		</div>
	</section>

	<footer class="mt-7 flex items-center justify-between text-slate-600">
		<div>
			<small>e!DAL — publish large plant genomics & phenomics datasets with DOIs</small>
		</div>
		<div class="flex items-center gap-3">
			<a
				class="btn text-slate-500 btn-ghost btn-sm"
				href="https://github.com/IPK-BIT/edal-web"
			>
				Source
            </a>
			<a
				class="btn text-slate-500 btn-ghost btn-sm"
				href="https://github.com/IPK-BIT/edal-web/issues"
			>
				Help
			</a>
		</div>
	</footer>
</section>
