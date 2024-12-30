import type { Item, Stores } from "@chiballc/nuxt-form-builder";

export function Boolish(val: any) {
	if (typeof val !== "string") return val;
	switch (true) {
		case val === "":
		case val === "null":
			return null;
		case val === "true":
			return true;
		case val === "false":
			return false;
		case val === "undefined":
			return undefined;
		default:
			return val;
	}
}

export function hasOwnProperties<T = any>(obj: T, properties: (keyof T)[], allowNullish = true) {
	if (typeof obj !== "object") return false;
	return properties.every((property) => {
		if (allowNullish) return obj?.hasOwnProperty(property);
		return obj?.hasOwnProperty(property) && Boolish(obj[property]) !== null && Boolish(obj[property]) !== undefined;
	});
}

export function parseData(data: any): {
	data: SocketTemplate;
	type: "json" | "string" | string;
} {
	let _data = data;
	if (typeof data === "string") {
		try {
			_data = JSON.parse(data);
		} catch (_) {
			console.warn("Invalid JSON", data);
			_data = data;
		}
	}

	if (hasRawData(_data)) {
		const decoder = new TextDecoder();
		try {
			_data = JSON.parse(decoder.decode(new Uint8Array(_data.rawData)));
		} catch (_) {
			console.warn("Invalid JSON");
		}
	}

	if (isSocketTemplate(data)) {
		return {
			data: data,
			type: "json",
		};
	}

	return _data;
}

export function hasRawData(data: any): data is { rawData: number[]; type: string } {
	return data?.rawData !== undefined;
}

export function createChannelName(...args: string[]) {
	return args.sort().join(":");
}

function isSocketTemplate(data: any): data is SocketTemplate {
	return hasOwnProperties<SocketTemplate>(data, ["type"]);
}

export function hasBoughtMerch(stores?: Stores | ReconstructedDbForm["stores"]) {
	if (!stores) return false;
	for (const key in stores) {
		for (const item of stores[key] || []) {
			if ((item as Item).carted) return true;
		}
	}
	return false;
}

type KeyValue<T> = { [K in keyof T]: T[K] };
type FinderFunction<T> = (arg: T, index: number, arr: T[]) => boolean;
type Finder<T> = T extends object ? Partial<KeyValue<T>> | boolean : T;

// TODO: Test implementation
/**
 * Deletes items from an array based on various matching criteria.
 * Modifies the original array and returns the modified array.
 *
 * @template T - The type of elements in the array
 * @param {T[]} arr - The input array to delete items from
 * @param {T | Finder<T> | FinderFunction<T>} [target] - The matching criteria:
 *   - If omitted: Clears the entire array
 *   - If primitive value: Matches by strict equality
 *   - If object: Matches by comparing object properties
 *   - If function: Uses custom matching logic
 * @param {Array<keyof T> | boolean} [comp] - Comparison options for object matching:
 *   - If array of keys: Only compares specified properties
 *   - If true: Performs deep equality comparison
 *   - If omitted/false: Compares all properties with shallow equality
 * @returns {T[]} The modified input array with matching items removed
 *
 * @example
 * // Delete by value
 * const numbers = [1, 2, 3, 2, 4];
 * deleteArrayItems(numbers, 2);
 * console.log(numbers); // [1, 3, 4]
 *
 * @example
 * // Delete by object properties
 * const users = [
 *   { id: 1, name: 'John' },
 *   { id: 2, name: 'Jane' },
 *   { id: 3, name: 'John' }
 * ];
 * deleteArrayItems(users, { name: 'John' });
 * console.log(users); // [{ id: 2, name: 'Jane' }]
 *
 * @example
 * // Delete using custom function
 * const numbers = [1, 2, 3, 4, 5];
 * deleteArrayItems(numbers, (n) => n % 2 === 0);
 * console.log(numbers); // [1, 3, 5]
 *
 * @example
 * // Delete by specific properties
 * const users = [
 *   { id: 1, name: 'John', age: 30 },
 *   { id: 2, name: 'Jane', age: 25 },
 *   { id: 3, name: 'John', age: 35 }
 * ];
 * deleteArrayItems(users, { name: 'John', age: 30 }, ['name', 'age']);
 * console.log(users); // [{ id: 2, name: 'Jane', age: 25 }, { id: 3, name: 'John', age: 35 }]
 *
 * @example
 * // Clear array
 * const numbers = [1, 2, 3];
 * deleteArrayItems(numbers);
 * console.log(numbers); // []
 */
export function deleteArrayItems<T>(arr: T[], target?: Finder<T> | FinderFunction<T>): T[];
export function deleteArrayItems<T extends object>(
	arr: T[],
	target: Partial<KeyValue<T>>,
	comp?: Array<keyof T> | boolean
): T[];
export function deleteArrayItems<T>(
	arr: T[],
	target?: T | Finder<T> | FinderFunction<T>,
	comp?: Array<keyof T> | boolean
): T[] {
	if (!arr || !arr.length) return arr ? arr : [];
	let getIndex: () => number;

	switch (true) {
		case !target:
			arr.length = 0;
			return arr;
		case typeof target === "object":
			if (Array.isArray(comp)) {
				getIndex = () =>
					arr.findIndex((item) => {
						for (const key of comp) {
							if (item[key] !== (target as Partial<T>)[key]) {
								return false;
							}
							return true;
						}
					});
			} else if (comp === true) {
				const deepEqual = function <T extends object>(obj1: T, obj2: T): boolean {
					if (obj1 === obj2) return true;

					if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
						return false;
					}

					const keys1 = Object.keys(obj1).sort();
					const keys2 = Object.keys(obj2).sort();

					if (keys1.length !== keys2.length) return false;

					for (const key of keys1) {
						if (!keys2.includes(key)) return false;
						// @ts-expect-error
						if (!deepEqual(obj1[key as keyof T], obj2[key as keyof T])) return false;
					}

					return true;
				};
				getIndex = () => arr.findIndex((item) => deepEqual(item as object, target));
			} else {
				getIndex = () =>
					arr.findIndex((item) => {
						for (const key in target as T) {
							if (item[key] !== (target as Partial<T>)[key]) {
								return false;
							}
						}
						return true;
					});
			}
			break;
		case typeof target === "function":
			getIndex = () => arr.findIndex(target as FinderFunction<T>);
			break;
		default:
			getIndex = () => arr.indexOf(target as T);
			break;
	}

	let index;
	// TODO: Improve, stop re-looping the list on each iteration, but collect the indexes that match the finding criteria
	while ((index = getIndex()) !== -1) {
		arr.splice(index, 1);
	}

	return arr;
}

export function assert<T>(value: T, message?: string): NonNullable<T> {
	if (!value) {
		message = message || "Expected a value but nullish found";
		if (createError) {
			throw createError({
				statusCode: 400,
				message,
			});
		} else {
			throw new Error(message);
		}
	}
	return value;
}

export function assertEnv<T>(value: T, name: string) {
	return assert(value, `Env variable ${name} not found. Please include it with a non-empty value`);
}
