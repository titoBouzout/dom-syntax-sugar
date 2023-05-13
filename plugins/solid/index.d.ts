// for solid-js
import 'solid-js'

declare module 'solid-js' {
	namespace JSX {
		// signal
		type DOMSugarSignalValue = {
			[x: string]: any
		}
		interface DOMSugarSignal {
			signal?: DOMSugarSignalValue
		}

		// callback
		type DOMSugarFunction = (el: HTMLElement & DOMSugarSignal) => void

		// attributes.js
		interface HTMLAttributes<T> {
			onMount?: DOMSugarFunction
			onCleanup?: DOMSugarFunction
			onEffect?: DOMSugarFunction
			onMountEffect?: DOMSugarFunction
		}

		// namescape.js

		interface DOMSugarPropertyFunction {
			[x: string]: DOMSugarFunction
		}
		interface DOMSugarPropertyValue {
			[x: string]: DOMSugarFunction | string | number | object | boolean
		}

		// callbacks functions
		type onEffectAttributes = {
			[Key in keyof DOMSugarPropertyFunction as `onEffect:${Key}`]?: DOMSugarPropertyFunction[Key]
		}
		type onMountAttributes = {
			[Key in keyof DOMSugarPropertyFunction as `onMount:${Key}`]?: DOMSugarPropertyFunction[Key]
		}
		type onMountEffectAttributes = {
			[Key in keyof DOMSugarPropertyFunction as `onMountEffect:${Key}`]?: DOMSugarPropertyFunction[Key]
		}

		// values
		type thisAttributes = {
			[Key in keyof DOMSugarPropertyValue as `this:${Key}`]?: DOMSugarPropertyValue[Key]
		}
		type signalAttributes = {
			[Key in keyof DOMSugarPropertyValue as `signal:${Key}`]?: DOMSugarPropertyValue[Key]
		}
		type onceAttributes = {
			[Key in keyof DOMSugarPropertyValue as `once:${Key}`]?: DOMSugarPropertyValue[Key]
		}

		interface HTMLAttributes<T>
			extends thisAttributes,
				onEffectAttributes,
				onMountAttributes,
				onMountEffectAttributes,
				signalAttributes,
				onceAttributes {}
	}
}
