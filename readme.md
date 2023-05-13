# Babel Plugin DOM Syntax Sugar

Syntax sugar for JSX. This project started as an exploratory and experimental babel plugin
to evaluate adding syntax sugar to SolidJS projects. See https://www.solidjs.com/

It grew into its own framework-agnostic _pluggable_ plugin. Provides support for solidjs
via a built-in plugin that you may enable, and you can bring your own syntax sugar to the
plugin via the configuration.

Note: It does stuff by hacking around the AST instead of doing it the proper way. It is
discouraged to use this plugin.

## Install

`npm install dom-syntax-sugar`

```json
{
	"babel": {
		"plugins": [
			[
				"dom-syntax-sugar",
				{
					"solid": true // enable/disable plugin solidjs syntax sugar
				}
			]
		]

		// ...
	}
}
```

## SolidJS Syntax Sugar

Ever growing list. Diabetes.

```jsx
<div
	// mounting
	onMount={element => console.log(element, 'div mounted!')}
	onCleanup={element => console.log(element, 'div unmounted!')}
	// effects
	onEffect={element => console.log(element, 'like createEffect!')}
	onMountEffect={element => console.log(element, 'effect inside mount!')}
	// same as class={/* @once */ styles.name}
	once:class={styles.name}
	// assigning functions to the element
	this:something={function something(element) {
		element.something === something
	}}
	// assign the function to the element and run it on the desired place
	onMount:something={function something(element) {}}
	onEffect:something={function something(element) {}}
	onMountEffect:something={function something(element) {}}
	// creating a signal
	signal:height={0}
	// reading and writing to a signal
	onMount={element => (element.signal.height = element.signal.height++)}
/>
```

### Attribute

| attribute       | description                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `onMount`       | binds and runs the function with the `element` as argument on `onMount`                          |
| `onCleanup`     | binds and runs the function with the `element` as argument on `onCleanup`                        |
| `onEffect`      | binds and runs the function with the `element` as argument on `createEffect`                     |
| `onMountEffect` | binds and runs the function with the `element` as argument on `createEffect` inside an `onMount` |

### Namespace

On which `___` is a name provided by the user. Example for `height` would be
`<div signal:height={0}/>`

| namespace           | description                                                                                                                                                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `this:___`          | binds and sets the function in `element` accessible by `element.___`                                                                                                                                                                                                                         |
| `onEffect:___`      | binds and sets the function in `element` accessible by `element.___`, pass it to `createEffect`                                                                                                                                                                                              |
| `onMount:___`       | binds and sets the function in `element` accessible by `element.___`, pass it to `onMount`                                                                                                                                                                                                   |
| `onMountEffect:___` | binds and sets the function in `element` accessible by `element.___`, pass it to `createEffect` inside an `onMount`                                                                                                                                                                          |
| `signal:___`        | creates a signal on `element.signal.___`, that could be used as a getter and setter. Example to set: `element.signal.height = 10`. If a function is passed as the initial value, it will execute the function with `element` as argument. It will do it on `ref` and then again on `onMount` |
| `once:___`          | `once:class={styles.name}` will become `class={/* @once */ styles.name}`                                                                                                                                                                                                                     |

### Bugs

- regular functions are bind to the element but `this` doesn't work due to a
  dom-expressions bug

## Plugins for the Plugin

You can bring your own sugar. Link to your definitions on the plugin configuration. Take a
look to the folder `plugins` of this repository for inspiration.

```json
{
	"babel": {
		"plugins": [
			[
				"dom-syntax-sugar",
				{
					"solid": true, // enable/disable syntax sugar for solidjs
					"path/to/your/own/sugar": true // your own
				}
			]
		]
	}
}
```

On the folder `path/to/your/own/sugar` there should be at least one of the two files
`attributes.js` and `namespace.js`.

You may enable or disable a plugin by toggling `true` to `false`.

### attributes.js and namespace.js

The files exports an array with the following shape:

```js
export default [
	{
		named: 'onMount', // jsx attribute to find
		replacement: 'ref', // jsx attribute to add as a replacement
		// code for the value of the attribute
		// it requires semicolons as whitespace is removed
		code: `
			item => {
				let v = __VALUE__;
				v = v.bind ? v.bind(item, item) : () => v(item);

				onMount(v)
			}`,
		// in case you need to import something
		imports: [
			{
				name: '{onMount}',
				source: 'solid-js',
			},
		],
	},
]
```

- `__VALUE__` refers to the content of the attribute in file.
- `__NAME__` refers to the name when using it as a `namespace`

## Bugs

- replacement `code` requires semicolons, as white-space is removed to try to fix line
  numbers

## TODO

- allow multiple passes over the same attribute
- add support for attributes without values (to be added by the plugins)
- maybe add some priority in case order matters
- refactor!
