import { store } from '$lib/stores/store.svelte';

export const getResource = (
	url: string,
	initialValue?: any) => {

	const _rune = $state<{ value: any | undefined }>({value: initialValue});
	let req: Request;

	$effect(() => {
		if(store.hostUrl && store.credentials) {
			req = new Request(`http://${store.hostUrl}/${url}/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Basic ' + store.credentials
				}
			});
		}
		fetch(req)
			.then((response) => response.json())
			.then((data) => {
				_rune.value = data;
			});
	});

	return _rune;
};
