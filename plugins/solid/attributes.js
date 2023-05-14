export default [
	/*
		priorities:
			- property 0
			- signal 1
			- mount/cleanup 2
			- effect 3
	*/
	{
		priority: 2,
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
				name: '{onMount}',
				source: 'solid-js',
			},
		],
	},
	{
		priority: 2,
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
				name: '{onCleanup}',
				source: 'solid-js',
			},
		],
	},
	{
		priority: 3,
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
				name: '{createEffect}',
				source: 'solid-js',
			},
		],
	},
	{
		priority: 2,
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
				name: '{onMount}',
				source: 'solid-js',
			},
			{
				name: '{createEffect}',
				source: 'solid-js',
			},
		],
	},
]
