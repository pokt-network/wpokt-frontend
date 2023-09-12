/********************************************************************************
 *   Ledger Node JS API
 *   (c) 2016-2017 Ledger
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/
import type Transport from "@ledgerhq/hw-transport";
import { Common, GetPublicKeyResult, SignTransactionResult, GetVersionResult, buildBip32KeyPayload, splitPath } from "./Common";

// @ts-ignore -- optional interface, should be any if not installed.
import { AbstractSigner, Account } from "@pokt-foundation/pocketjs-signer";

// export { GetPublicKeyResult, SignTransactionResult, GetVersionResult };

/*
interface class IAbstractSigner {
  getAddress(): string
  getAccount(): Account
  getPublicKey(): string
  getPrivateKey(): string
  sign(payload: string): Promise<string>
}

type Signer = any extends AbstractSigner ? any : AbstractSigner;
*/

export class LedgerPoktSigner extends AbstractSigner {
  address: string;
  publicKey: string;
  pokt: Pokt;
  path: string;

  constructor(pokt: Pokt, path: string, pkr: GetPublicKeyResult) {
    super();
    this.address = Buffer.from(pkr.address!).toString('hex');
    this.publicKey = Buffer.from(pkr.publicKey).toString('hex');
    this.pokt = pokt;
    this.path = path;
  }

  getAddress() : string {
    return this.address;
  }

  getAccount() : Account {
    return { address: this.address, publicKey: this.publicKey, privateKey: "UNAVAILABLE" };
  }

  getPublicKey() : string {
    return this.publicKey;
  }

  getPrivateKey() : string {
    return "UNAVAILABLE";
  }

  async sign(payload: string): Promise<string> {
    const { signature } = await this.pokt.signTransaction(this.path, payload);
    return Buffer.from(signature).toString('hex');
  }
}

/**
 * Pokt API
 *
 * @example
 * import Pokt from "hw-app-pokt";
 * const pokt = new Pokt(transport)
 */

export default class Pokt extends Common {
  
  constructor(transport: Transport) {
    super(transport, "PKT", "Pocket");
    this.sendChunks = this.sendWithBlocks;
  }

  async getSigner(path: string): Promise<LedgerPoktSigner> {
    const pkr = await this.getPublicKey(path);
    return new LedgerPoktSigner(this, path, pkr);
  }

  /**
    * Blind Sign a transaction with the key at a BIP32 path.
    *
    * @param txn - The transaction; this can be any of a node Buffer, Uint8Array, or a hexadecimal string, encoding the form of the transaction appropriate for hashing and signing.
    * @param path - the path to use when signing the transaction.
    */
  async blindSignTransaction(
    path: string,
    txn: string | Buffer | Uint8Array,
  ): Promise<SignTransactionResult> {
    const paths = splitPath(path);
    const cla = 0x00;
    const ins = 0x04;
    const p1 = 0;
    const p2 = 0;
    // Transaction payload is the byte length as uint32le followed by the bytes
    // Type guard not actually required but TypeScript can't tell that.
    if(this.verbose) this.log(txn);
    const rawTxn = typeof txn == "string" ? Buffer.from(txn, "hex") : Buffer.from(txn);
    const hashSize = Buffer.alloc(4);
    hashSize.writeUInt32LE(rawTxn.length, 0);
    // Bip32key payload same as getPublicKey
    const bip32KeyPayload = buildBip32KeyPayload(path);
    // These are just squashed together
    const payload_txn = Buffer.concat([hashSize, rawTxn]);
    this.log("Payload Txn", payload_txn);
    // TODO batch this since the payload length can be uint32le.max long
    const signature = await this.sendChunks(cla, ins, p1, p2, [payload_txn, bip32KeyPayload]);
    return {
      signature,
    };
  }
}


