import { store } from '$lib/stores/store.svelte';

export const fetchUrl = <T>(
	url: string,
	initialValue?: T) => {

	const _rune = $state<{ value: T | undefined }>({value: initialValue});
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
			fetch(req)
				.then((response) => response.json())
				.then((data) => {
					if (data?.LL?.value) {
						_rune.value = data.LL.value;
					}
				});
		}
	});

	return _rune;
};
