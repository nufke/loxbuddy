import { store } from '$lib/stores/Store.svelte';

export const fetchUrl = <T>(
	url: string,
	initialValue?: T) => {

	const _rune = $state<{ value: T | undefined }>({value: initialValue});
	let req: Request;

	$effect(() => {
		if(store.loginCredentials.hostUrl.length) {
			req = new Request(`${store.loginCredentials.hostUrl}/${url}/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Basic ' + store.loginCredentials.credentials
				}
			});
			fetch(req)
				.then((response) => response.json())
				.then((data) => {
					//console.log('data', data)
					if (data?.LL?.value) {
						_rune.value = data.LL.value;
					} else {
						_rune.value = data;
					}
				});
		}
	});

	return _rune;
};
