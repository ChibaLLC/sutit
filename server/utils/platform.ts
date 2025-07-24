export const platformCommands = {
  tail(lines: number, log: string = "log") {
    return {
      win32: `powershell -Command "Get-Content .\\logs\\${log}.log -Tail ${lines}"`,
      default: `tail -n ${lines} ./logs/${log}.log`,
    };
  },
};

type ParameterType<T> = T extends (...args: infer P) => any ? P : never;
export function getCommand<T extends keyof typeof platformCommands>(
  commandType: T,
  ...args: ParameterType<(typeof platformCommands)[T]>
) {
  // @ts-expect-error
  const command = platformCommands[commandType](...args);
  if (!command) {
    throw new Error(`Command ${commandType} not found`);
  }
  return command[process.platform === "win32" ? "win32" : "default"];
}
