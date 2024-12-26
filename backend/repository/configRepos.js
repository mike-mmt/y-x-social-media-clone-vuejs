export let pool, client;

export function config(newClient, newPool) {
    client = newClient;
    pool = newPool;
}