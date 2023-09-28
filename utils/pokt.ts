export function parsePokt(amount: string | number): bigint {
    return BigInt(Number(amount) * 1e6)
}

export function formatPokt(amount: string | bigint): string {
    return (BigInt(amount) / BigInt(1e6)).toString()
}

export const UPOKT = 1000000;

export const STDX_MSG_TYPES = {
    unjail: "pos/MsgUnjail",
    unjail8: "pos/8.0MsgUnjail",
    unstake: "pos/MsgBeginUnstake",
    unstake8: "pos/8.0MsgBeginUnstake",
    stake: "pos/MsgStake",
    send: "pos/Send",
    stake8: "pos/8.0MsgStake",
};