export default [
	{
		named: 'onMount',
		replacement: 'ref',
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : () => v(item);

				onMount(v)
			}`,
	},
	{
		named: 'onCleanup',
		replacement: 'ref',
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : () => v(item);

				onCleanup(v)
			}`,
	},
	{
		named: 'onEffect',
		replacement: 'ref',
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : () => v(item);

				createEffect(v)
			}`,
	},
	{
		named: 'onMountEffect',
		replacement: 'ref',
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : () => v(item);

				onMount(() =>
					createEffect(v)
				)
			}`,
	},
]
