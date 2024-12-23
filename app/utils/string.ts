export function useCapitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function collapseString(str: string | undefined | null | string[] | any): string | null {
    return Boolish(str)
}

export function isEmail(val: string) {
	return val.includes("@");
}

export function isPhone(val: string) {
	const regex = /^\+?\d{1,3}([ -]?\d{2,4}){2,4}$/;
	const exp = new RegExp(regex);
	return exp.test(val);
}