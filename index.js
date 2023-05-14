import generate from '@babel/generator'
import template from '@babel/template'
import path from 'path'
import fs from 'fs'

import * as url from 'url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const __dirname_import = new URL('.', import.meta.url).href

// something crazy is happening on this file that everything is returning .default

const _generate = 'default' in generate ? generate.default : generate
const _template = 'default' in template ? template.default : template

function getUnwrappedValue(node) {
	const code = _generate(node.value).code

	return /^\s*{/.test(code) ? code.replace(/^\s*{/, '').replace(/}\s*$/, '') : code
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
function replaceAttribute(path, attr, code, name, node, priority) {
	const template = parse(
		code
			.replace(/\s/g, ' ')
			.replace(/__NAME__/g, name)
			.replace(/__VALUE__/g, getUnwrappedValue(node)),
	)

	const lineNumber = node.value.expression.loc.start.line - 1

	node.value.expression = template.program.body[0].expression

	fixLineNumbers(lineNumber, node.value.expression)

	addAttribute(attr, node.value, priority)

	removeAttribute(path, node)
}

let toAdd = []
function addAttribute(attr, value, priority) {
	toAdd.push({
		priority: priority,
		attribute: t.jSXAttribute(t.jSXIdentifier(attr), value),
	})
}
function addAttributes(path) {
	toAdd = toAdd.sort((a, b) => b.priority - a.priority)
	for (const attribute of toAdd) {
		path.node.attributes.push(attribute.attribute)
	}
	toAdd = []
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

async function importPlugin(url) {
	const plugin = await import(url).catch(e => {})

	return plugin !== undefined && 'default' in plugin ? plugin.default : plugin
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
	const cleanName = name.replace(/{/, '').replace(/}/, '').trim()
	if (!imports[cleanName]) {
		imports[cleanName] = true
		body.unshift(_template.ast(`import ${name} from "${source}"`))
	}
}

function fileExists(f) {
	return fs.existsSync(f)
}

export default async function (api, options) {
	t = api.types
	parse = api.parse

	const attributesPlugins = makeIndex([])
	const namespacePlugins = makeIndex([])

	let plugin
	for (const _path in options) {
		if (!options[_path]) continue
		if (fileExists(__dirname + 'plugins/' + _path + '/')) {
			// local plugin
			plugin = await importPlugin(
				__dirname_import + 'plugins/' + _path + '/attributes.js',
			)
			if (plugin) {
				makeIndex(plugin, attributesPlugins)
			}
			plugin = await importPlugin(__dirname_import + 'plugins/' + _path + '/namespace.js')

			if (plugin) {
				makeIndex(plugin, namespacePlugins)
			}
		} else if (!fileExists('../../' + _path + '/')) {
			// external plugin but folder doesnt exists
			console.error(
				'dom-syntax-sugar: cant find plugin',
				'../../' + _path + '/',
				'resolved as',
				path.resolve('../../' + _path + '/'),
			)
		} else if (
			!fileExists('../../' + _path + '/attributes.js') &&
			!fileExists('../../' + _path + '/namespace.js')
		) {
			// external plugin but none of both exists, probably a mistake

			console.error(
				'dom-syntax-sugar: both attributes.js and namespace.js does not exist in plugin folder',
				'../../' + _path + '/',
				'resolved as',
				path.resolve('../../' + _path + '/'),
			)
		} else {
			plugin = await importPlugin('../../' + _path + '/attributes.js')
			if (plugin) {
				makeIndex(plugin, attributesPlugins)
			}

			plugin = await importPlugin('../../' + _path + '/namespace.js')
			if (plugin) {
				makeIndex(plugin, namespacePlugins)
			}
		}
	}

	return {
		visitor: {
			Program(path) {
				body = path.node.body
				imports = []
				toAdd = []
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
											plugin.priority,
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
						addAttributes(path)
					},
				})
			},
		},
	}
}
