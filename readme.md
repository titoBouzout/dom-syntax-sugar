# Babel Plugin Solid Syntax Sugar

Syntax sugar for SolidJS JSX. See https://www.solidjs.com/

Note: This is an exploratory and experimental babel plugin to evaluate adding syntax sugar to SolidJS projects. It does stuff by hacking around the AST instead of doing it the proper way. It is discouraged to use this plugin.

## At a glance

Ever growing list. Diabetes.

```jsx
<div
	// mounting
	onMount={element => console.log(element, 'div mounted!')}
	onCleanup={element => console.log(element, 'div unmounted!')}
	// effects
	onEffect={element => console.log(element, 'like createEffect!')}
	onMountEffect={element =>
		console.log(element, 'effect inside mount!')
	}
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
	onMount={element =>
		(element.signal.height = element.signal.height++)
	}
/>
```

## Install

`npm install babel-plugin-solid-syntax-sugar`

```json
"babel": {
	"plugins": [
		["babel-plugin-solid-syntax-sugar"]
	],
	"presets": ["solid"]
}
```

## Attribute

| attribute | description |
| --- | --- |
| `onMount` | binds and runs the function with the `element` as argument on `onMount` |
| `onCleanup` | binds and runs the function with the `element` as argument on `onCleanup` |
| `onEffect` | binds and runs the function with the `element` as argument on `createEffect` |
| `onMountEffect` | binds and runs the function with the `element` as argument on `createEffect` inside an `onMount` |

## Namespace

On which `___` is a name provided by the user. Example for `height` would be `<div signal:height={0}/>`

| namespace | description |
| --- | --- |
| `this:___` | binds and sets the function in `element` accesible by `element.___` |
| `onEffect:___` | binds and sets the function in `element` accesible by `element.___`, pass it to `createEffect` |
| `onMount:___` | binds and sets the function in `element` accesible by `element.___`, pass it to `onMount` |
| `onMountEffect:___` | binds and sets the function in `element` accesible by `element.___`, pass it to `createEffect` inside an `onMount` |
| `signal:___` | creates a signal on `element.signal.___`, that could be used as a getter and setter. Example to set: `element.signal.height = 10`. If a function is passed as the initial value, it will execute the function with `element` as argument. It will do it on `ref` and then again on `onMount` |
| `once:___` | `once:class={styles.name}` will become `class={/* @once */ styles.name}` |

## Plugins for the Plugin

You can bring your own sugar. Link to your definitions on the plugin configuration. Take a look to the folder `plugins` of this repo for inspiration.

```json
"babel": {
	"plugins": [
		["babel-plugin-solid-syntax-sugar", {
			"attributes": "path/to/your/attributes.js",
			"namespace": "path/to/your/namespace.js"
		}]
	],
	"presets": ["solid"]
}
```

`__VALUE__` refers to the content of the attribute. `__NAME__` refers to the name when using it as `namespace`

## Bugs

- regular functions are bind to the element but `this` doesnt work due to a dom-expressions bug
- replacement `code` requires semicolons, as whitespace is removed to try to fix line numbers

## TODO

- allow multiple passes over the same attribute?
- maybe add some priority in case order matters
- add support for attributes without values (to be added by the plugins)
