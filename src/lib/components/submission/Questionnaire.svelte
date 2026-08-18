<script lang="ts">
	import FieldWrapper from './wrapper/FieldWrapper.svelte';
	import ComponentWrapper from './wrapper/ComponentWrapper.svelte';
	import String from './fields/String.svelte';
	import steps from '$lib/config/steps.json';
	import Textarea from './fields/Textarea.svelte';
	import License from './fields/License.svelte';
	import OntologyAnnotations from './fields/OntologyAnnotations.svelte';
	import People from './components/People.svelte';
	import Files from './components/Files.svelte';
	import Dla from './components/Dla.svelte';
	import Preview from './components/Preview.svelte';
	import { datasetObj, currentStep, type Author, type Dataset } from '$lib/stores/dataset';
	import { onMount } from 'svelte';
	import Schemas from '$lib/js';

	// let $currentStep = $state(0);

	const fieldTypes = {
		string: String,
		textarea: Textarea,
		license: License,
		'onto-autocomplete': OntologyAnnotations
	};

	const componentTypes = {
		people: People,
		files: Files,
		dla: Dla,
		preview: Preview
	};

	onMount(() => {
		if ($currentStep === 0) {
			executeHook($currentStep);
		}
	});

	function executeHook(idx: number) {
		if (steps[idx] && steps[idx].hooks && Array.isArray(steps[idx].hooks)) {
			steps[idx].hooks.forEach((hook) => {
				if (datasetObj.keyed) {
					let obj = datasetObj.keyed(hook.state.mapping);
					let emptyObj = Schemas.getObjectFromSchema(hook.type);
					if (hook.state.count === 1) {
						obj.set(emptyObj);
					}
				}
			});
		}
	}

	function getValueByPath(obj: unknown, path: string) {
		// path: "metadata.title" etc
		return path.split('.').reduce((o: unknown, k: string) => {
			if (o && typeof o === 'object' && k in (o as Record<string, unknown>)) {
				return (o as Record<string, unknown>)[k];
			}
			return undefined;
		}, obj as unknown);
	}

	async function next() {
		// Validate required fields for the current step
		const step = steps[$currentStep];
		if (step.fields) {
			const missing = [];
			for (const field of step.fields) {
				if (field.mapping.jsonPath === 'metadata.title') {
					const response = await fetch(
						`https://dmz-web-169.ipk-gatersleben.de/submission/info/exists?title=${encodeURIComponent(`${getValueByPath($datasetObj, field.mapping.jsonPath)}`)}`,
						{
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${localStorage.getItem('access_token')}`
							}
						}
					);
					if (response.status === 200) {
						alert('A dataset with this title already exists. Please choose a different title.');
						return;
					}
				}
				if (field.required) {
					const value = getValueByPath($datasetObj, field.mapping.jsonPath);
					if (
						value === undefined ||
						value === null ||
						(typeof value === 'string' && value.trim() === '')
					) {
						missing.push(field.label);
					}
				}
			}
			if (missing.length > 0) {
				alert('Please fill out the following required field(s):\n' + missing.join(', '));
				return;
			}
		}
		// Additional validation for authors step
		if (step.jsonPath === 'metadata.authors') {
			const authors: Author[] = $datasetObj.metadata.authors;
			const hasCreator = authors.some((author) => author.role === 'Creator');
			if (!hasCreator) {
				alert('You need to specify at least one author with the Creator role.');
				return;
			}
			let missingOrcids: string[] = [];
			for (const author of authors) {
				if (!author.orcid || (typeof author.orcid === 'string' && author.orcid.trim() === '')) {
					missingOrcids.push(
						author.lastName ? `${author.firstName} ${author.lastName}` : 'Unnamed Author'
					);
				}
			}
			if (missingOrcids.length > 0) {
				alert('Please provide ORCID for the following author(s):\n' + missingOrcids.join(', '));
				return;
			}
		}

		// Additional validation for DLA step
		if (step.jsonPath === 'dlaRead') {
			if (!$datasetObj.dlaRead) {
				alert(
					'You must read the Data Deposition and License Agreement (DDLA) prior to proceeding.'
				);
				return;
			}
		}

		// Additional validation for Files step
		if (step.component === 'files') {
			if ($datasetObj.file_transfer_mode === 'local') {
				if (Object.keys($datasetObj.files).length === 0) {
					alert('Please upload at least one file before proceeding.');
					return;
				}
			} else if ($datasetObj.file_transfer_mode === 's3') {
				const s3 = $datasetObj.s3access;
				const missing = [];
				if (!s3.endpoint || s3.endpoint.trim() === '') missing.push('S3 Endpoint URL');
				if (!s3.bucket || s3.bucket.trim() === '') missing.push('Bucket Name');
				if (!s3.region || s3.region.trim() === '') missing.push('Region Name');
				if (!s3.accessKey || s3.accessKey.trim() === '') missing.push('Access Key');
				if (!s3.secretKey || s3.secretKey.trim() === '') missing.push('Secret Key');
				if (missing.length > 0) {
					alert('Please fill out the following S3 field(s):\n' + missing.join(', '));
					return;
				}
				if (!s3.validated) {
					alert('Please validate the S3 connection before proceeding.');
					return;
				}
			}
		}

		if ($currentStep < steps.length - 1) {
			$currentStep += 1;
			executeHook($currentStep);
		}
	}

	function prev() {
		if ($currentStep > 0) {
			$currentStep -= 1;
		}
	}

	// let index = 0;
	let fileId = $state(0);

	let isSubmitting = $state(false);
	let submitPhase = $state<'uploading' | 'finalizing' | 's3'>('uploading');
	let uploadDone = $state(0);
	let uploadTotal = $state(0);
	let submitDialog: HTMLDialogElement | undefined = $state();
	let lastSubmissionMode: 'local' | 's3' = $state('local');

	$effect(() => {
		if (!isSubmitting) return;
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = '';
		};
		window.addEventListener('beforeunload', handleBeforeUnload);
		return () => window.removeEventListener('beforeunload', handleBeforeUnload);
	});

	function finish() {
		if (
			!confirm(
				'By clicking OK, you acknowledge that you have read and agree to the Data Deposition and License Agreement (DLA).'
			)
		) {
			return;
		}

		let access_token = localStorage.getItem('access_token');

		if ($datasetObj.file_transfer_mode === 'local') {
			if (Object.keys($datasetObj.files).length === 0) {
				alert('Please upload at least one file before finishing the submission.');
				return;
			}
			const fileQueue = Array.from(
				{ length: Object.keys($datasetObj.files).length },
				(_, i) => i
			).reverse();
			let activeConnections = 0,
				threadsQuantity = 10;

			isSubmitting = true;
			submitPhase = 'uploading';
			uploadDone = 0;
			uploadTotal = fileQueue.length;
			submitDialog?.showModal();

			sendNextFile();

			function sendNextFile() {
				if (activeConnections >= threadsQuantity) {
					return;
				}
				if (!fileQueue.length) {
					if (!activeConnections) {
						submitPhase = 'finalizing';
						fetch('https://dmz-web-169.ipk-gatersleben.de/submission/publication/publish', {
							method: 'POST',
							headers: {
								Authorization: `Bearer ${access_token}`,
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								title: $datasetObj.metadata.title
							})
						})
							.then(() => {
								lastSubmissionMode = 'local';
								sendSuccessNotification();
								//   index = 0;
								fileId = 0;
								$datasetObj = Schemas.getObjectFromSchema('dataset') as Dataset;
								executeHook(0);
								$currentStep = 0;
							})
							.catch((err) => {
								console.error('Error publishing dataset metadata:', err);
							})
							.finally(() => {
								isSubmitting = false;
								submitDialog?.close();
							});
					}
					return;
				}
				fileId = fileQueue.pop()!;
				const file = $datasetObj.files![fileId];
				let formData = new FormData();
				formData.set('file', file, file.name);

				let metadata = JSON.parse(JSON.stringify($datasetObj.metadata));
				metadata.authors = (metadata.authors || []).map((author: Record<string, unknown>) => {
					const { affiliation, city, ...rest } = author as Record<string, unknown>;
					return {
						...rest,
						address: `${affiliation ?? ''}, ${city ?? ''}, ${(author as Record<string, unknown>).address ?? ''}`
					} as Record<string, unknown>;
				});

				formData.set('metaData', JSON.stringify(metadata));

				let pathArr = file.webkitRelativePath.split('/');
				pathArr[0] = $datasetObj.metadata.title;
				let path = pathArr.slice(0, -1).join('/');
				formData.set('path', path);
				activeConnections++;
				let base_url = 'https://dmz-web-169.ipk-gatersleben.de/submission';
				// let base_url = 'http://localhost:8000';
				fetch(`${base_url}/upload/dataset`, {
					method: 'POST',
					body: formData,
					headers: {
						Authorization: `Bearer ${access_token}`
					}
				})
					.then(() => {
						activeConnections--;
						uploadDone++;
						sendNextFile();
					})
					.catch((err) => {
						console.error('Error uploading file:', err);
						activeConnections--;
						fileQueue.push(fileId);
						sendNextFile();
					});
			}
		} else if ($datasetObj.file_transfer_mode == 's3') {
			const s3 = $datasetObj.s3access;
			const missing = [];
			if (!s3.endpoint || s3.endpoint.trim() === '') missing.push('S3 Endpoint URL');
			if (!s3.bucket || s3.bucket.trim() === '') missing.push('Bucket Name');
			if (!s3.accessKey || s3.accessKey.trim() === '') missing.push('Access Key');
			if (!s3.secretKey || s3.secretKey.trim() === '') missing.push('Secret Key');
			if (missing.length > 0) {
				alert('Please fill out the following S3 field(s):\n' + missing.join(', '));
				return;
			}
			let base_url = 'https://dmz-web-169.ipk-gatersleben.de/submission';
			// let base_url = 'http://localhost:8000';
			let formData = new FormData();
			// for (const key in $datasetObj) {
			// 	let value = $datasetObj[key];
			// 	if (typeof value === 'object') {
			// 		formData.append(key, JSON.stringify(value));
			// 	} else {
			// 		formData.append(key, value);
			// 	}
			// }
			formData.append('s3access', JSON.stringify($datasetObj.s3access));
			let metadata = JSON.parse(JSON.stringify($datasetObj.metadata));
			metadata.authors = (metadata.authors || []).map((author: Record<string, unknown>) => {
				const { affiliation, city, ...rest } = author as Record<string, unknown>;
				return {
					...rest,
					address: `${affiliation ?? ''}, ${city ?? ''}, ${(author as Record<string, unknown>).address ?? ''}`
				} as Record<string, unknown>;
			});
			formData.append('metadata', JSON.stringify(metadata));

			isSubmitting = true;
			fetch(`${base_url}/upload/s3upload`, {
				method: 'POST',
				body: formData,
				headers: {
					Authorization: `Bearer ${access_token}`
					// Do NOT set Content-Type for FormData, browser will handle it
				}
			})
				.then(() => {
					fileId = 0;
					$datasetObj = Schemas.getObjectFromSchema('dataset') as Dataset;
					executeHook(0);
					$currentStep = 0;
				})
				.catch((err) => {
					console.error('Error submitting S3 info:', err);
				})
				.finally(() => {
					isSubmitting = false;
				});

			lastSubmissionMode = 's3';
			sendSuccessNotification();
		}
	}

	function sendSuccessNotification() {
		const toast = document.getElementById('toast');
		if (toast) {
			toast.removeAttribute('hidden');
			setTimeout(() => {
				toast.setAttribute('hidden', 'true');
			}, 5000);
		}
	}
</script>

{#if steps.length > 0}
	<dialog
		bind:this={submitDialog}
		class="modal"
		oncancel={(e) => e.preventDefault()}
		aria-labelledby="submit-progress-title"
	>
		<div class="modal-box flex flex-col items-center gap-4 text-center">
			<span class="loading loading-lg loading-spinner text-primary"></span>
			{#if submitPhase === 'uploading'}
				<h3 id="submit-progress-title" class="text-lg font-bold">Uploading files…</h3>
				<p class="text-sm text-neutral">
					Please keep this window open. Each file is uploaded individually, so this may take a
					while.
				</p>
				<progress class="progress w-full progress-primary" value={uploadDone} max={uploadTotal}
				></progress>
				<p class="text-sm text-neutral">{uploadDone} of {uploadTotal} files uploaded</p>
			{:else}
				<h3 id="submit-progress-title" class="text-lg font-bold">Finalizing submission…</h3>
				<p class="text-sm text-neutral">
					All files have been uploaded. Publishing your dataset now.
				</p>
			{/if}
		</div>
	</dialog>

	<div id="toast" hidden class="toast toast-end toast-top z-10 mt-24">
		<div class="alert alert-success">
			{#if lastSubmissionMode === 'local'}
				<span>Submission sent successfully.</span>
			{:else}
				<span
					>Submission initiated successfully. Please be aware this might take a while depending on
					the size of your bucket.</span
				>
			{/if}
		</div>
	</div>

	<section class="mb-8 rounded-lg border border-base-300 p-4">
		<h2 class="text-2xl font-bold">Step {$currentStep + 1} of {steps.length}</h2>
		<p class="m-2 font-semibold text-neutral">{steps[$currentStep].title}</p>

		<div class="p-0">
			<div>
				{#key $currentStep}
					{#if steps[$currentStep].text}
						{#each steps[$currentStep].text as paragraph (paragraph)}
							<p class="mx-4 text-sm text-neutral">{paragraph}</p>
						{/each}
					{/if}

					{#if steps[$currentStep].fields}
						{#each steps[$currentStep].fields as field (field)}
							<FieldWrapper
								component={fieldTypes[field.type as keyof typeof fieldTypes]}
								jsonPath={field.mapping.jsonPath}
								{field}
							/>
						{/each}
					{/if}

					{#if steps[$currentStep].component}
						<ComponentWrapper
							component={componentTypes[
								steps[$currentStep].component as keyof typeof componentTypes
							]}
							jsonPath={steps[$currentStep].jsonPath}
							componentConfig={steps[$currentStep].componentConfig}
						/>
					{/if}
				{/key}
			</div>
		</div>

		<div class="divider"></div>

		<div class="m-2 flow-root">
			{#if $currentStep > 0}
				<button class="btn btn-secondary" disabled={isSubmitting} onclick={prev}>Previous</button>
			{/if}

			{#if $currentStep === 0}
				<button class="btn float-right btn-primary" onclick={next}>I agree</button>
			{:else if $currentStep < steps.length - 1}
				<button class="btn float-right btn-primary" onclick={next}>Next</button>
			{:else}
				<button class="btn float-right btn-primary" disabled={isSubmitting} onclick={finish}
					>Finish</button
				>
			{/if}
		</div>
	</section>
{/if}
