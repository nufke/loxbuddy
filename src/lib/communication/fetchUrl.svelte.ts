import { appStore } from '$lib/stores/LbAppStore.svelte';

export const fetchUrl = <T>(
	url: string,
	initialValue?: T) => {

	const _rune = $state<{ value: T | undefined }>({value: initialValue});
	let req: Request;

	$effect(() => {
		if(appStore.loginCredentials.hostUrl.length) {
			const found = url.match(/^http/);
			req = new Request(found ? url : `${appStore.loginCredentials.hostUrl}/${url}/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Basic ' + appStore.loginCredentials.credentials
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
