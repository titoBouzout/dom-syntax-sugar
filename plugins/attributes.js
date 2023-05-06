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
		imports: [
			{
				name: 'onMount',
				source: 'solid-js',
			},
		],
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
		imports: [
			{
				name: 'onCleanup',
				source: 'solid-js',
			},
		],
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
		imports: [
			{
				name: 'createEffect',
				source: 'solid-js',
			},
		],
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
		imports: [
			{
				name: 'onMount',
				source: 'solid-js',
			},
			{
				name: 'createEffect',
				source: 'solid-js',
			},
		],
	},
]
