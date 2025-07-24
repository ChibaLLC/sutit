export type Phone = number | `+${string}` | `0${string}`;
export type Email = `${string}@${string}.${string}`;
export type Contact = Phone | Email;
