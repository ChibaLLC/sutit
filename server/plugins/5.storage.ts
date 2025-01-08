import storage from "~~/storage";
export default defineNitroPlugin(() => {
	Object.defineProperty(global, "$storage", {
		value: storage,
		writable: false,
		enumerable: true,
		configurable: false,
	}); 
});
