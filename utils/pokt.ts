export function parsePokt(amount: string | number | bigint): bigint {
    return BigInt(amount) * BigInt(1e6)
}

export function formatPokt(amount: string | number | bigint): string {
    return (BigInt(amount) / BigInt(1e6)).toString()
}