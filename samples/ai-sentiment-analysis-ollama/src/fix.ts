const _backup: WorkerLocation = globalThis.location;
// @ts-ignore
delete globalThis['location']

export const restoreLocation = (): void => {
    globalThis['location'] = _backup;
}