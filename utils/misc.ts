export function isValidEthAddress(address: string): boolean {
    const characters = "0123456789abcdefABCDEF".split("")
    const invalidChars = address.substring(2).split("").filter(c => !characters.includes(c))
    if (address.length === 42 && address.startsWith("0x") && !invalidChars.length) {
        return true
    }
    return false
}