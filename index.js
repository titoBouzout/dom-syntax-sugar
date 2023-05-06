import generate from '@babel/generator'

function getUnwrappedValue(node) {
	const code = generate.default(node.value).code

	return /^\s*{/.test(code)
		? code.replace(/^\s*{/, '').replace(/}\s*$/, '')
		: code
}
export default function (api) {
	const t = api.types
	const parse = api.parse
	return {
		visitor: {
			JSXElement(path, state) {
				path.traverse({
					JSXOpeningElement(path, state) {
						let toRemove = []
						for (let node of path.node.attributes) {
							if (!node.name || !node.name.name) continue

							if (node.name.namespace) {
								switch (node.name.namespace.name) {
									case 'once': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// add the leading comment
										t.addComment(
											node.value.expression,
											'leading',
											'@once',
										)

										// add it as a new attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier(node.name.name.name),
												node.value,
											),
										)
										break
									}
									case 'this': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
												item["${node.name.name.name}"] = ${getUnwrappedValue(
												node,
											)}.bind(item, item)
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new `ref` attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}
									case 'onEffect': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
												item["${node.name.name.name}"] = ${getUnwrappedValue(
												node,
											)}.bind(item, item)
												createEffect(() =>
 													item["${node.name.name.name}"](item)
 												)
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new `ref` attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}
									case 'onMount': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
												item["${node.name.name.name}"] = ${getUnwrappedValue(
												node,
											)}.bind(item, item)
												onMount(() =>
 													item["${node.name.name.name}"](item)
 												)
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new `ref` attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}
									case 'onMountEffect': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
												item["${node.name.name.name}"] = ${getUnwrappedValue(
												node,
											)}.bind(item, item)
 												onMount(() =>
													createEffect(() =>
														item["${node.name.name.name}"](item)
													)
 												)
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new `ref` attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}
									case 'signal': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
												const signal = item.signal || (item.signal = {})
												const [read, write] = createSignal(${getUnwrappedValue(node)})
												Object.defineProperty(signal, "${node.name.name.name}", {
													get() {
 														return read();
													},
													set(newValue) {
 														write(newValue);
													},
													enumerable: true,
													configurable: true,
												})
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new `ref` attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}
								}
							} else {
								switch (node.name.name) {
									case 'onMount': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
												onMount(() =>
													(${getUnwrappedValue(node)})(item)
												)
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new `ref` attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}

									case 'onUnmount': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
 												onCleanup(() =>
 													(${getUnwrappedValue(node)})(item)
 												)
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new `ref` attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}

									case 'onEffect': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
												const fn = ${getUnwrappedValue(node)}
 												createEffect(() =>
 													fn(item)
 												)
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new `ref` attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}

									case 'onMountEffect': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
												const fn = ${getUnwrappedValue(node)}
 												onMount(() =>
 													createEffect(() => fn(item))
 												)
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new `ref` attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}
								}
							}
						}
						// remove the syntax sugar attribute
						toRemove.forEach(function (n) {
							path.node.attributes.splice(
								path.node.attributes.indexOf(n),
								1,
							)
						})
					},
				})
			},
		},
	}
}
