# Babel Plugin Solid Syntax Sugar

Syntax sugar for SolidJS JSX. See https://www.solidjs.com/

Note: This is an exploratory and experimental babel plugin to evaluate adding syntax sugar to SolidJS projects. It does stuff by hacking around the AST instead of doing it the proper way.

Note: It is discouraged to use this plugin, is just an experiment. Just get used to the solid way.

## Install

`npm install babel-plugin-solid-syntax-sugar`

## Usage

```js
"babel": {
	"plugins": [
		["babel-plugin-solid-syntax-sugar"]
	],
	"presets": ["solid"]
}
```

## Attribute Functionality

### `onMount`

Runs the function on `onMount`

```jsx
<div onMount={item => console.log(item, 'mounted!')} />
```

becomes

```jsx
<div
	ref={item => {
		onMount(() => (item => console.log(item, 'mounted!'))(item))
	}}
/>
```

#### Bugs:

- It doesn't add the `onMount` import

### `onUnmount`

Runs the function on `onCleanup`

```jsx
<div onUnmount={item => console.log(item, 'unmounted!')} />
```

becomes

```jsx
<div
	ref={item => {
		onCleanup(() => (item => console.log(item, 'unmounted!'))(item))
	}}
/>
```

#### Bugs:

- It doesn't add the `onCleanup` import to the file

### `onEffect`

Runs the function on a `createEffect`

```jsx
<div onEffect={item => console.log(item, 'unmounted!')} />
```

becomes

```jsx
<div
	ref={item => {
		const fn = item => console.log(item, 'effect!')
		createEffect(() => fn(item))
	}}
/>
```

#### Bugs:

- It doesn't add the `createEffect` import to the file

### `onMountEffect`

Runs the function on a `createEffect` inside an `onMount`

```jsx
<div onMountEffect={item => console.log(item, 'unmounted!')} />
```

becomes

```jsx
<div
	ref={item => {
		const fn = item => console.log(item, 'effect!')
		onMount(() => createEffect(() => fn(item)))
	}}
/>
```

#### Bugs:

- It doesn't add the `createEffect` nor the `onMount` imports to the file

## Namespaced Attribute Functionality

### `once:`

It adds the ability to use `once:` prefix on JSX attributes.

```jsx
<div once:class={styles.name} />
```

becomes

```jsx
<div class={/* @once */ styles.name} />
```

### `this:`

It assigns a `regular function` to the `Element`

Note: The idea of binding is for allowing using `this` to refer to the `Element`

```jsx
<div this:something={function something() {}} />
```

becomes

```jsx
<div
	ref={item => {
		item.something = function something() {}.bind(item, item)
	}}
/>
```

#### Bugs:

- This will fail if you pass an arrow function
- `this` doesnt work due to a dom-expressions bug

### `onEffect:`

It assigns a `regular function` to the `Element` and runs it on `createEffect`

Note: The idea of binding is for allowing using `this` to refer to the `Element`

```jsx
<div onEffect:something={function something() {}} />
```

becomes

```jsx
<div
	ref={item => {
		item.something = function something() {}.bind(item, item)
		createEffect(() => item.something(item))
	}}
/>
```

#### Bugs:

- It doesn't add the `createEffect` import to the file
- This will fail if you pass an arrow function
- `this` doesnt work due to a dom-expressions bug

### `onMount:`

It assigns a `regular function` to the `Element` and runs it on `onMount`

Note: The idea of binding is for allowing using `this` to refer to the `Element`

```jsx
<div onMount:something={function something() {}} />
```

becomes

```jsx
<div
	ref={item => {
		item.something = function something() {}.bind(item, item)
		onMount(() => item.something(item))
	}}
/>
```

#### Bugs:

- It doesn't add the `onMount` import to the file
- This will fail if you pass an arrow function
- `this` doesnt work due to a dom-expressions bug

### `onMountEffect:`

It assigns a `regular function` to the `Element` and runs it on a `createEffect` inside an `onMount`

Note: The idea of binding is for allowing using `this` to refer to the `Element`

```jsx
<div onMountEffect:something={function something() {}} />
```

becomes

```jsx
<div
	ref={item => {
		item.something = function something() {}.bind(item, item)
		onMount(() => createEffect(() => item.something(item)))
	}}
/>
```

#### Bugs:

- It doesn't add the `onMount` nor `createEffect` imports to the file
- This will fail if you pass an arrow function
- `this` doesnt work due to a dom-expressions bug

### `signal:`

It creates a signal that can be written and read via `Element.signal.name`

```jsx
<div signal:height={0} />
```

becomes

```jsx
<div
	ref={item => {
		const signal = item.signal || (item.signal = {})
		const [read, write] = createSignal(0)
		Object.defineProperty(signal, 'height', {
			get() {
				return read()
			},
			set(newValue) {
				write(newValue)
			},
			enumerable: true,
			configurable: true,
		})
	}}
/>
```

#### Bugs:

- It doesn't add the `createSignal` imports to the file
