# Babel Plugin Solid Syntax Sugar

Syntax sugar for SolidJS JSX. See https://www.solidjs.com/

This is an exploratory and experimental babel plugin to evaluate adding syntax sugar to SolidJS projects.

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

## Functionality

### `once:`

It adds the ability to use `once:` prefix on JSX attributes.

```jsx
<div once:class={styles.name} />
```

becomes

```jsx
<div class={/* @once */ styles.name} />
```

### `onMount`

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
