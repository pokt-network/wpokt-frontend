export function parsePokt(amount: string | number | bigint) {
    return (BigInt(amount) * BigInt(1e6)).toString()
}

export function formatPokt(amount: string | number | bigint) {
    return (BigInt(amount) / BigInt(1e6)).toString()
}