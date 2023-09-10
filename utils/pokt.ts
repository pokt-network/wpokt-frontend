export function parsePokt(amount: string | number): bigint {
    return BigInt(Number(amount) * 1e6)
}

export function formatPokt(amount: string | bigint): string {
    return (BigInt(amount) / BigInt(1e6)).toString()
}

export const UPOKT = 1000000;