import generate from '@babel/generator'
import template from '@babel/template'

// something crazy is happening on this file that everything is returning .default

const _generate = 'default' in generate ? generate.default : generate
const _template = 'default' in template ? template.default : template

function getUnwrappedValue(node) {
	const code = _generate(node.value).code

	return /^\s*{/.test(code)
		? code.replace(/^\s*{/, '').replace(/}\s*$/, '')
		: code
}

function fixLineNumbers(lineNumber, object) {
	for (let id in object) {
		if (typeof object[id] === 'object' && object[id] !== null) {
			fixLineNumbers(lineNumber, object[id])
		} else if (id === 'line') {
			object[id] = lineNumber + object[id]
		}
	}
}

let parse
let t
function replaceAttribute(path, attr, code, name, node) {
	const template = parse(
		code
			.replace(/\s/g, ' ')
			.replace(/__NAME__/g, name)
			.replace(/__VALUE__/g, getUnwrappedValue(node)),
	)

	const lineNumber = node.value.expression.loc.start.line - 1

	node.value.expression = template.program.body[0].expression

	fixLineNumbers(lineNumber, node.value.expression)

	addAttribute(path, attr, node.value)

	removeAttribute(path, node)
}

function addAttribute(path, attr, value) {
	path.node.attributes.push(
		t.jSXAttribute(t.jSXIdentifier(attr), value),
	)
}

let toRemove = []
function removeAttribute(path, node) {
	toRemove.push([path, node])
}
function removeAttributes() {
	toRemove.forEach(item => {
		let index = item[0].node.attributes.indexOf(item[1])
		if (index !== -1) item[0].node.attributes.splice(index, 1)
	})
	toRemove = []
}

// something crazy is happening on this file that everything is returning .default
async function importPlugin(url) {
	const plugin = await import(url)
	return 'default' in plugin ? plugin.default : plugin
}

function makeIndex(plugins, index = {}) {
	for (const plugin of plugins) {
		if (!index[plugin.named]) {
			index[plugin.named] = []
		}
		index[plugin.named].push(plugin)
	}
	return index
}

let body
let imports

function addImport(name, source) {
	if (!imports[name]) {
		imports[name] = true
		body.unshift(_template.ast(`import {${name}} from "${source}"`))
	}
}

export default async function (api, options) {
	t = api.types
	parse = api.parse

	const attributesPlugins = makeIndex(
		await importPlugin('./plugins/attributes.js'),
	)

	const namespacePlugins = makeIndex(
		await importPlugin('./plugins/namespace.js'),
	)

	if (options.attributes) {
		makeIndex(
			await importPlugin('../../' + options.attributes),
			attributesPlugins,
		)
	}
	if (options.namespace) {
		makeIndex(
			await importPlugin('../../' + options.namespace),
			namespacePlugins,
		)
	}

	return {
		visitor: {
			Program(path) {
				body = path.node.body
				imports = []
			},
			ImportDeclaration(path) {
				path.traverse({
					Identifier(path) {
						if (path.key === 'local') {
							imports[path.node.name] = true
						}
					},
				})
			},

			JSXElement(path, state) {
				path.traverse({
					JSXOpeningElement(path, state) {
						for (let node of path.node.attributes) {
							// spread
							if (!node.name) continue

							let name
							let plugins

							if (!node.name.namespace) {
								name = node.name.name
								plugins = attributesPlugins
							} else {
								name = node.name.namespace.name
								plugins = namespacePlugins
							}
							if (plugins[name]) {
								for (const plugin of plugins[name]) {
									if (typeof plugin.code === 'function') {
										plugin.code(
											path,
											node,
											t,
											node.name.name.name,
											node.value,
											removeAttribute,
											addAttribute,
										)
									} else {
										replaceAttribute(
											path,
											plugin.replacement,
											plugin.code,
											node.name.name.name,
											node,
										)
									}
									if (plugin.imports) {
										for (const imported of plugin.imports) {
											addImport(imported.name, imported.source)
										}
									}
								}
							}
						}
						removeAttributes()
					},
				})
			},
		},
	}
}
