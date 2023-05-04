import generate from '@babel/generator'

function getUnwrappedCode(node) {
	return generate
		.default(node.value)
		.code.replace(/^\s*{/, '')
		.replace(/}\s*$/, '')
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
							// once:
							if (
								node.name.namespace &&
								node.name.namespace.name === 'once'
							) {
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
							} else {
								switch (node.name.name) {
									// onMount={...}
									case 'onMount': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => { onMount(()=> ( ${getUnwrappedCode(
												node,
											)} )(item)) }`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new ref attribute
										path.node.attributes.push(
											t.jSXAttribute(
												t.jSXIdentifier('ref'),
												node.value,
											),
										)
										break
									}
									// onUnmount={...}
									case 'onUnmount': {
										// syntax sugar node should be removed
										toRemove.push(node)

										// create the function template
										const template = parse(
											`item => {
 												onCleanup(()=> (
													${getUnwrappedCode(node)}
												)(item))
											}`,
										)

										// replace the expression
										node.value.expression =
											template.program.body[0].expression

										// add the new ref attribute
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
