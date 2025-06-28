import type { ConsolaInstance } from "consola";
import type storage from "~~/storage";

declare global {
	namespace NodeJS {
		interface Global {
			log: ConsolaInstance;
			$storage: typeof storage;
		}
	}

	var log: ConsolaInstance;
	var $storage: typeof storage;

	interface Window {
		alert: (message: string, options: NotificationOptions) => void;
		alertError: (message: string, options?: Pick<NotificationOptions, "timeout">) => void;
		alertSuccess: (message: string, options?: Pick<NotificationOptions, "timeout">) => void;
		alertInfo: (message: string, options?: Pick<NotificationOptions, "timeout">) => void;
	}

	type MapValueType<T> = T extends Map<any, infer V> ? V : never;
	type AllOrNothing<T> =
		| { [K in keyof T]: T[K] }
		| { [K in keyof T]: undefined };
    type MaybePromise<T> = Promise<T> | T
}
