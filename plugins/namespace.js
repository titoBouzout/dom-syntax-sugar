export default [
	{
		named: 'this',
		replacement: 'ref',
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : () => v(item);

				item["__NAME__"] = v;
			}`,
	},
	{
		named: 'onEffect',
		replacement: 'ref',
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : () => v(item);

				item["__NAME__"] = v;
				createEffect(item["__NAME__"])
			}`,
	},
	{
		named: 'onMount',
		replacement: 'ref',
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : () => v(item);

				item["__NAME__"] =  v;
				onMount(item["__NAME__"])
			}`,
	},
	{
		named: 'onMountEffect',
		replacement: 'ref',
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : () => v(item);

				item["__NAME__"] =  v;
					onMount(() =>
						createEffect(item["__NAME__"])
					)
			}`,
	},
	{
		named: 'signal',
		replacement: 'ref',
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : v;
				const isFunction = typeof v === "function";
				const signal = item.signal || (item.signal = {});
				const [get, set] = createSignal(isFunction ? v(item) : v);
				Object.defineProperty(signal, "__NAME__", {
					get,
					set,
					enumerable: true,
					configurable: true,
				});
				if(isFunction)
					onMount(() => item.signal["__NAME__"] = v(item))
			}`,
	},
	{
		named: 'once',
		code: function (
			path,
			node,
			t,
			name,
			value,
			removeAttribute,
			addAttribute,
		) {
			removeAttribute(path, node)

			t.addComment(value.expression, 'leading', '@once')

			addAttribute(path, name, value)
		},
	},
]
