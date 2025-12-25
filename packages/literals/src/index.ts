import type { Template } from "../types"

function createTempateStringArray(strings: string[]): TemplateStringsArray {
	const toReturn: any = strings;
	toReturn.raw = [...strings];

	return toReturn
}

export function raw(strings: TemplateStringsArray, ...values: unknown[]): Template {
	return {
		strings,
		values,
		toString() {
			let toReturn = '';

			for (let i = 0; i < this.strings.raw.length; i++) {
				toReturn += this.strings.raw[i];

				if (i < this.values.length) {
					toReturn += String(this.values[i]);
				}
			}

			return toReturn;
		},
	}
}

export function pushTemplate(template: Template) {
	return (strings: TemplateStringsArray, ...values: unknown[]): Template => {
		const prevStrings = [...template.strings.raw]

		if (prevStrings.at(-1) != undefined) {
			prevStrings[prevStrings.length - 1] = prevStrings[prevStrings.length - 1]! + strings.raw[0]
		}

		prevStrings.push(...strings.slice(1))

		return raw(createTempateStringArray(prevStrings),
			...template.values,
			...values
		)
	}
}