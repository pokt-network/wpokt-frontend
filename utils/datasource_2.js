import {
  Pocket,
  Configuration,
  typeGuard,
  RpcError,
  CoinDenom,
  Hex,
  TxSignature,
  TransactionSender,
  ProtoTransactionSigner,
} from "@pokt-network/pocket-js";
import { getGatewayClient } from "./gateway_2";
import { parsePokt } from "./pokt";
// import axios from "axios";
// import PoktErrors from "./errors";
// import { UPOKT } from "../utils/utils";
import { Config } from "./config";
import { LEDGER_CONFIG } from "./ledger";

export const PoktErrors = {
  ConfigErrors: {
    RequiredParam: (paramName) => `DataSourceConfigError: ${paramName} is required, but none was configured`,
  }
}

// export const dataSourceConfig = {
//   gatewayUrl: `https://mainnet.gateway.pokt.network/v1/lb/${process.env.POKT_RPC_KEY}`,
//   http: {
//     timeout: 0,
//     headers: {"Content-Type": "application/json", "Blockchain-Subdomain": "mainnet"},
//   },
//   chainId: 'mainnet',
//   txFee: 10000,
//   blockTime: 900000,
//   maxTransactionListCount: 15,
//   useLegacyCodec: true
// }

export async function sendTransaction(
  pocketApp,
  dataSource,
  publicKey,
  fromAddress,
  toAddress,
  amount,
  memo,
) {
  /* global BigInt */
  const entropy = Number(
    BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
  ).toString();

  const tx = {
    chain_id: Config.CHAIN_ID,
    entropy: entropy,
    fee: [
      {
        amount: Config.TX_FEE || "10000",
        denom: "upokt",
      },
    ],
    memo: memo ? memo : "Pocket Wallet",
    msg: {
      type: 'pos/Send',
      value: {
        amount: amount.toString(),
        from_address: fromAddress,
        to_address: toAddress,
      },
    },
  };

  try {
    const stringifiedTx = JSON.stringify(tx);
    const hexTx = Buffer.from(stringifiedTx, "utf-8").toString("hex");
    const sig = await pocketApp.signTransaction(
      LEDGER_CONFIG.derivationPath,
      hexTx
    );

    const ledgerTxResponse = await dataSource.sendTransactionFromLedger(
      publicKey,
      sig.signature,
      tx
    );
    if (typeGuard(ledgerTxResponse, Error)) {
      return ledgerTxResponse;
    }

    return ledgerTxResponse;
  } catch (e) {
    console.error("error: ", e);
    return e;
  }
};

export const dataSourceConfig = {
  gatewayUrl: Config.GATEWAY_BASE_URL,
  http: {
    timeout: Config.HTTP_TIMEOUT,
    headers: Config.HTTP_HEADERS !== "" ? JSON.parse(Config.HTTP_HEADERS) : {},
  },
  chainId: Config.CHAIN_ID,
  txFee: Config.TX_FEE,
  maxTransactionListCount: Config.MAX_TRANSACTION_LIST_COUNT,
  useLegacyCodec: Config.USE_LEGACY_CODEC === "false" ? false : true
}

export const getDataSource = () => new DataSource(dataSourceConfig);

export class DataSource {
  constructor(config) {
    const gatewayUrl = config ? config.gatewayUrl || "" : "";
    const httpConfig = config ? config.http || {} : {};

    if (gatewayUrl === "") {
      throw PoktErrors.ConfigErrors.RequiredParam("gatewayUrl");
    }

    if (Object.keys(httpConfig).length === 0) {
      console.warn(PoktErrors.ConfigErrors.RequiredParam("http"));
    }

    this.gwClient = getGatewayClient(gatewayUrl, httpConfig);

    const pocketClientConfiguration = new Configuration(
      1,
      1000,
      0,
      20000,
      undefined,
      undefined,
      Number(config.blockTime),
      undefined,
      false,
      false,
      config.useLegacyCodec
    );

    this.__pocket = new Pocket([""], undefined, pocketClientConfiguration);

    this.config = config;
  }

  // /**
  //  * @returns {Account}
  //  */
  // async exportPPKFromAccount(account, passphrase) {
  //   const ppkOrError = await this.__pocket.keybase.exportPPKfromAccount(
  //     account.addressHex,
  //     passphrase,
  //     "pocket wallet",
  //     passphrase
  //   );

  //   return ppkOrError;
  // }

  // /**
  //  * @returns {Account}
  //  */
  // async createAccount(passphrase) {
  //   const accountOrError = await this.__pocket.keybase.createAccount(
  //     passphrase
  //   );

  //   if (typeGuard(accountOrError, Error)) {
  //     return undefined;
  //   } else {
  //     return accountOrError;
  //   }
  // }

  // /**
  //  * @returns {Account}
  //  */
  // async importPortablePrivateKey(password, jsonStr, passphrase) {
  //   const accountOrError = await this.__pocket.keybase.importPPKFromJSON(
  //     password,
  //     jsonStr,
  //     passphrase
  //   );

  //   if (typeGuard(accountOrError, Error)) {
  //     return accountOrError;
  //   } else {
  //     return accountOrError;
  //   }
  // }

  // /**
  //  *
  //  * @returns {Account}
  //  */
  // async importAccount(privateKey, passphrase) {
  //   const accountOrError = await this.__pocket.keybase.importAccount(
  //     Buffer.from(privateKey, "hex"),
  //     passphrase
  //   );

  //   if (typeGuard(accountOrError, Error)) {
  //     return undefined;
  //   } else {
  //     return accountOrError;
  //   }
  // }

  // /**
  //  * @returns {UnlockedAccount}
  //  */
  // async getUnlockedAccount(addressHex, passphrase) {
  //   const unlockedOrError = await this.__pocket.keybase.getUnlockedAccount(
  //     addressHex,
  //     passphrase
  //   );

  //   if (typeGuard(unlockedOrError, Error)) {
  //     return undefined;
  //   } else {
  //     return unlockedOrError;
  //   }
  // }

  // /**
  //  * @returns {object}
  //  */
  // async exportPPK(privateKey, passphrase) {
  //   const ppkOrError = await this.__pocket.keybase.exportPPK(
  //     privateKey,
  //     passphrase,
  //     "pocket wallet"
  //   );

  //   if (typeGuard(ppkOrError, Error)) {
  //     return undefined;
  //   } else {
  //     return ppkOrError;
  //   }
  // }

  // /**
  //  * @returns {Number}
  //  */
  // async getBalance(address) {
  //   let balanceResponse;
  //   try {
  //     balanceResponse = await this.gwClient.makeQuery("getBalance", address, 0);
  //   } catch (error) {
  //     console.log(error);
  //     return 0;
  //   }

  //   const uPOKT = Number(balanceResponse?.balance?.toString());
  //   return (uPOKT ? uPOKT : 0) / UPOKT;
  // }

  // /**
  //  * @returns {Float}
  //  */
  // async getPrice() {
  //   const response = await axios.get(
  //     "https://supply.research.pokt.network:8192/price"
  //   );
  //   const data = response["data"];
  //   if (response["status"] === 200 && data) {
  //     return data;
  //   } else {
  //     return -1;
  //   }
  // }

  // /**
  //  * @returns {Object}
  //  */
  // async getTx(txHash) {
  //   let txResponse;
  //   try {
  //     txResponse = await this.gwClient.makeQuery("getTransaction", txHash);
  //   } catch (error) {
  //     console.log(error);
  //     return undefined;
  //   }

  //   return txResponse;
  // }

  // /**
  //  * @returns {Object | undefined}
  //  */
  // async getApp(address) {
  //   let app;

  //   try {
  //     app = await this.gwClient.makeQuery("getApp", address, 0);
  //   } catch (error) {
  //     console.log(error);
  //     return undefined;
  //   }

  //   return app;
  // }

  // /**
  //  * @returns {Object | undefined}
  //  */
  // async getNode(address) {
  //   let node;
  //   try {
  //     node = await this.gwClient.makeQuery("getNode", address, 0);
  //   } catch (error) {
  //     console.log(error);
  //     return undefined;
  //   }

  //   return node;
  // }

  // /**
  //  * @returns {Object}
  //  */
  // async sendTransaction(
  //   ppk,
  //   passphrase,
  //   toAddress,
  //   amount,
  //   memo = "Pocket Wallet"
  // ) {
  //   // uPOKT
  //   const defaultFee = this.config.txFee || 10000;

  //   const accountOrUndefined = await this.__pocket.keybase.importPPKFromJSON(
  //     passphrase,
  //     ppk,
  //     passphrase
  //   );

  //   if (typeGuard(accountOrUndefined, Error)) {
  //     return new Error(
  //       "Failed to import account due to wrong passphrase provided"
  //     );
  //   }

  //   const transactionSenderOrError = await this.__pocket.withImportedAccount(
  //     accountOrUndefined.address,
  //     passphrase
  //   );

  //   if (typeGuard(transactionSenderOrError, RpcError)) {
  //     return new Error(transactionSenderOrError.message);
  //   }

  //   const rawTxPayloadOrError = await transactionSenderOrError
  //     .send(accountOrUndefined.addressHex, toAddress, amount.toString())
  //     .createTransaction(
  //       this.config.chainId,
  //       defaultFee.toString(),
  //       CoinDenom.Upokt,
  //       memo
  //     );

  //   if (typeGuard(rawTxPayloadOrError, RpcError)) {
  //     console.log(
  //       `Failed to process transaction with error: ${rawTxPayloadOrError}`
  //     );
  //     return new Error(rawTxPayloadOrError.message);
  //   }

  //   let rawTxResponse;
  //   try {
  //     rawTxResponse = await this.gwClient.makeQuery(
  //       "sendRawTx",
  //       rawTxPayloadOrError.address,
  //       rawTxPayloadOrError.txHex
  //     );
  //   } catch (error) {
  //     console.log(`Failed to send transaction with error: ${error.raw_log}`);
  //     return new Error(error.raw_log);
  //   }

  //   return rawTxResponse;
  // }

  async sendTransactionFromLedger(publicKey, signature, tx) {
    const {
      chain_id: chainID,
      entropy,
      fee,
      memo,
      msg: {
        value: { amount, from_address: fromAddress, to_address: toAddress },
      },
    } = tx;

    const txSignature = new TxSignature(
      Buffer.from(publicKey, "hex"),
      Buffer.from(signature, "hex")
    );

    const transactionSender = new TransactionSender(
      this.__pocket,
      null,
      null,
      true
    );

    const itxSender = transactionSender.send(fromAddress, toAddress, amount);

    const unsignedTransaction = itxSender.createUnsignedTransaction(
      chainID,
      fee[0].amount,
      entropy,
      "Upokt",
      memo
    );

    if (typeGuard(unsignedTransaction, RpcError)) {
      console.log(
        `Failed to process transaction with error: ${unsignedTransaction}`
      );
      return new Error(unsignedTransaction);
    }

    const { bytesToSign, stdTxMsgObj } = unsignedTransaction;
    const rawTxOrError = ProtoTransactionSigner.signTransaction(
      stdTxMsgObj,
      bytesToSign,
      txSignature
    );
    if (typeGuard(rawTxOrError, RpcError)) {
      console.log(`Failed to process transaction with error: ${rawTxOrError}`);
      return new Error(rawTxOrError.message);
    }
    let rawTxResponse;
    try {
      // rawTxResponse = await this.gwClient.makeQuery(
      //   "sendRawTx",
      //   rawTxOrError.address,
      //   rawTxOrError.txHex
      // );
      rawTxResponse = await fetch(`/api/tx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: rawTxOrError.address.toString("hex"),
          raw_hex_bytes: rawTxOrError.txHex.toString("hex"),
        })
      })
    } catch (error) {
      console.log(`Failed to send transaction with error: ${error.raw_log}`);
      return new Error(error.raw_log);
    }

    return rawTxResponse;
  }

  // /**
  //  * @returns {Object}
  //  */
  // async unjailNode(ppk, passphrase, nodeAddress) {
  //   // uPOKT
  //   const defaultFee = this.config.txFee || 10000;

  //   const accountOrUndefined = await this.__pocket.keybase.importPPKFromJSON(
  //     passphrase,
  //     ppk,
  //     passphrase
  //   );

  //   if (typeGuard(accountOrUndefined, Error)) {
  //     return new Error(
  //       "Failed to import account due to wrong passphrase provided"
  //     );
  //   }

  //   const transactionSenderOrError = await this.__pocket.withImportedAccount(
  //     accountOrUndefined.address,
  //     passphrase
  //   );

  //   if (typeGuard(transactionSenderOrError, RpcError)) {
  //     return new Error(transactionSenderOrError.message);
  //   }

  //   const rawTxPayloadOrError = await transactionSenderOrError
  //     .nodeUnjail(nodeAddress, accountOrUndefined.addressHex)
  //     .createTransaction(
  //       this.config.chainId,
  //       defaultFee.toString(),
  //       CoinDenom.Upokt,
  //       "Unjail Node - Pocket Wallet"
  //     );

  //   if (typeGuard(rawTxPayloadOrError, RpcError)) {
  //     console.log(
  //       `Failed to process transaction with error: ${rawTxPayloadOrError.message}`
  //     );
  //     return new Error(rawTxPayloadOrError.message);
  //   }

  //   let rawTxResponse;
  //   try {
  //     rawTxResponse = await this.gwClient.makeQuery(
  //       "sendRawTx",
  //       rawTxPayloadOrError.address,
  //       rawTxPayloadOrError.txHex
  //     );
  //   } catch (error) {
  //     console.log(`Failed to send transaction with error: ${error.raw_log}`);
  //     return new Error(error.raw_log);
  //   }

  //   return rawTxResponse;
  // }

  // /**
  //  * @returns {Object}
  //  */
  // async unstakeNode(ppk, passphrase, nodeAddress) {
  //   // uPOKT
  //   const defaultFee = this.config.txFee || 10000;

  //   const accountOrUndefined = await this.__pocket.keybase.importPPKFromJSON(
  //     passphrase,
  //     ppk,
  //     passphrase
  //   );

  //   if (typeGuard(accountOrUndefined, Error)) {
  //     return new Error(
  //       "Failed to import account due to wrong passphrase provided"
  //     );
  //   }

  //   const transactionSenderOrError = await this.__pocket.withImportedAccount(
  //     accountOrUndefined.address,
  //     passphrase
  //   );

  //   if (typeGuard(transactionSenderOrError, RpcError)) {
  //     return new Error(transactionSenderOrError.message);
  //   }

  //   const rawTxPayloadOrError = await transactionSenderOrError
  //     .nodeUnstake(nodeAddress, accountOrUndefined.addressHex)
  //     .createTransaction(
  //       this.config.chainId,
  //       defaultFee.toString(),
  //       CoinDenom.Upokt,
  //       "Unstake Node - Pocket Wallet"
  //     );

  //   if (typeGuard(rawTxPayloadOrError, RpcError)) {
  //     console.log(
  //       `Failed to process transaction with error: ${rawTxPayloadOrError}`
  //     );
  //     return new Error(rawTxPayloadOrError.message);
  //   }

  //   let rawTxResponse;
  //   try {
  //     rawTxResponse = await this.gwClient.makeQuery(
  //       "sendRawTx",
  //       rawTxPayloadOrError.address,
  //       rawTxPayloadOrError.txHex
  //     );
  //   } catch (error) {
  //     console.log(`Failed to send transaction with error: ${error.raw_log}`);
  //     return new Error(error.raw_log);
  //   }

  //   return rawTxResponse;
  // }

  // async stakeNode(
  //   ppk,
  //   passphrase,
  //   nodePubKey,
  //   outputAddress,
  //   chains,
  //   amount,
  //   serviceURI
  // ) {
  //   const defaultFee = this.config.txFee || 10000;
  //   const accountOrUndefined = await this.__pocket.keybase.importPPKFromJSON(
  //     passphrase,
  //     ppk,
  //     passphrase
  //   );

  //   if (typeGuard(accountOrUndefined, Error)) {
  //     return new Error(
  //       "Failed to import account due to wrong passphrase provided"
  //     );
  //   }

  //   const transactionSenderOrError = await this.__pocket.withImportedAccount(
  //     accountOrUndefined.address,
  //     passphrase
  //   );

  //   if (typeGuard(transactionSenderOrError, RpcError)) {
  //     return new Error(transactionSenderOrError.message);
  //   }
  //   const rawTxPayloadOrError = await transactionSenderOrError
  //     .nodeStake(nodePubKey, outputAddress, chains, amount, serviceURI)
  //     .createTransaction(
  //       this.config.chainId,
  //       defaultFee.toString(),
  //       CoinDenom.Upokt,
  //       "Stake Node - Pocket Wallet"
  //     );

  //   if (typeGuard(rawTxPayloadOrError, RpcError)) {
  //     console.log(
  //       `Failed to process transaction with error: ${rawTxPayloadOrError}`
  //     );
  //     return new Error(rawTxPayloadOrError.message);
  //   }

  //   let rawTxResponse;
  //   try {
  //     rawTxResponse = await this.gwClient.makeQuery(
  //       "sendRawTx",
  //       rawTxPayloadOrError.address,
  //       rawTxPayloadOrError.txHex
  //     );
  //   } catch (error) {
  //     console.log(`Failed to send transaction with error: ${error.raw_log}`);
  //     return new Error(error.raw_log);
  //   }

  //   return rawTxResponse;
  // }

  // async stakeNodeFromLedger(publicKey, signature, url, tx) {
  //   const {
  //     chain_id: chainID,
  //     msg: {
  //       value: { chains, public_key, value, output_address },
  //     },
  //     fee,
  //     entropy,
  //   } = tx;

  //   const txSignature = new TxSignature(
  //     Buffer.from(publicKey, "hex"),
  //     Buffer.from(signature, "hex")
  //   );

  //   const transactionSender = new TransactionSender(
  //     this.__pocket,
  //     null,
  //     null,
  //     true
  //   );

  //   const itxSender = transactionSender.nodeStake(
  //     public_key.value,
  //     output_address,
  //     chains,
  //     value,
  //     url
  //   );

  //   const unsignedStakeTx = itxSender.createUnsignedTransaction(
  //     chainID,
  //     fee[0].amount,
  //     entropy,
  //     CoinDenom.Upokt,
  //     "Stake Node - Pocket Wallet"
  //   );

  //   if (typeGuard(unsignedStakeTx, RpcError)) {
  //     console.log(
  //       `Failed to process transaction with error: ${unsignedStakeTx}`
  //     );
  //     return new Error(unsignedStakeTx);
  //   }

  //   const { bytesToSign, stdTxMsgObj } = unsignedStakeTx;
  //   const rawTxOrError = ProtoTransactionSigner.signTransaction(
  //     stdTxMsgObj,
  //     bytesToSign,
  //     txSignature
  //   );
  //   if (typeGuard(rawTxOrError, RpcError)) {
  //     console.log(`Failed to process transaction with error: ${rawTxOrError}`);
  //     return new Error(rawTxOrError.message);
  //   }

  //   let rawTxResponse;
  //   try {
  //     rawTxResponse = await this.gwClient.makeQuery(
  //       "sendRawTx",
  //       rawTxOrError.address,
  //       rawTxOrError.txHex
  //     );
  //   } catch (error) {
  //     console.log(`Failed to send transaction with error: ${error.raw_log}`);
  //     return new Error(error.raw_log);
  //   }

  //   return rawTxResponse;
  // }

  // async unjailNodeFromLedger(publicKey, signature, tx) {
  //   const {
  //     msg: {
  //       value: { address: toAddress, signer_address: signerAddress },
  //     },
  //     chain_id: chainID,
  //     fee,
  //     entropy,
  //     memo,
  //   } = tx;
  //   const txSignature = new TxSignature(
  //     Buffer.from(publicKey, "hex"),
  //     Buffer.from(signature, "hex")
  //   );

  //   const transactionSender = new TransactionSender(
  //     this.__pocket,
  //     null,
  //     null,
  //     true
  //   );

  //   const itxSender = transactionSender.nodeUnjail(toAddress, signerAddress);

  //   const unsignedUnjailTx = itxSender.createUnsignedTransaction(
  //     chainID,
  //     fee[0].amount,
  //     entropy,
  //     "Upokt",
  //     memo
  //   );

  //   if (typeGuard(unsignedUnjailTx, RpcError)) {
  //     console.log(
  //       `Failed to process transaction with error: ${unsignedUnjailTx}`
  //     );
  //     return new Error(unsignedUnjailTx);
  //   }

  //   const { bytesToSign, stdTxMsgObj } = unsignedUnjailTx;
  //   const rawTxOrError = ProtoTransactionSigner.signTransaction(
  //     stdTxMsgObj,
  //     bytesToSign,
  //     txSignature
  //   );

  //   if (typeGuard(rawTxOrError, RpcError)) {
  //     console.log(`Failed to process transaction with error: ${rawTxOrError}`);
  //     return new Error(rawTxOrError.message);
  //   }

  //   let rawTxResponse;
  //   try {
  //     rawTxResponse = await this.gwClient.makeQuery(
  //       "sendRawTx",
  //       rawTxOrError.address,
  //       rawTxOrError.txHex
  //     );
  //   } catch (error) {
  //     console.log(`Failed to send transaction with error: ${error.raw_log}`);
  //     return new Error(error.raw_log);
  //   }

  //   return rawTxResponse;
  // }

  // async unstakeNodeFromLedger(publicKey, signature, tx) {
  //   const {
  //     msg: {
  //       value: {
  //         validator_address: validatorAddress,
  //         signer_address: signerAddress,
  //       },
  //     },
  //     chain_id: chainID,
  //     fee,
  //     entropy,
  //     memo,
  //   } = tx;

  //   const txSignature = new TxSignature(
  //     Buffer.from(publicKey, "hex"),
  //     Buffer.from(signature, "hex")
  //   );

  //   const transactionSender = new TransactionSender(
  //     this.__pocket,
  //     null,
  //     null,
  //     true
  //   );

  //   const itxSender = transactionSender.nodeUnstake(
  //     validatorAddress,
  //     signerAddress
  //   );
  //   const unsignedUnstakeTx = itxSender.createUnsignedTransaction(
  //     chainID,
  //     fee[0].amount,
  //     entropy,
  //     "Upokt",
  //     memo
  //   );

  //   if (typeGuard(unsignedUnstakeTx, RpcError)) {
  //     console.log(
  //       `Failed to process transaction with error: ${unsignedUnstakeTx}`
  //     );
  //     return new Error(unsignedUnstakeTx);
  //   }

  //   const { bytesToSign, stdTxMsgObj } = unsignedUnstakeTx;
  //   const rawTxOrError = ProtoTransactionSigner.signTransaction(
  //     stdTxMsgObj,
  //     bytesToSign,
  //     txSignature
  //   );
  //   if (typeGuard(rawTxOrError, RpcError)) {
  //     console.log(`Failed to process transaction with error: ${rawTxOrError}`);
  //     return new Error(rawTxOrError.message);
  //   }

  //   let rawTxResponse;
  //   try {
  //     rawTxResponse = await this.gwClient.makeQuery(
  //       "sendRawTx",
  //       rawTxOrError.address,
  //       rawTxOrError.txHex
  //     );
  //   } catch (error) {
  //     console.log(`Failed to send transaction with error: ${error.raw_log}`);
  //     return new Error(error.raw_log);
  //   }

  //   return rawTxResponse;
  // }

  // /**
  //  * @returns {Object}
  //  */
  // mergeTxs(received, sent) {
  //   //
  //   received.txs.forEach((tx) => {
  //     tx.type = "Received";
  //   });
  //   //
  //   sent.txs.forEach((tx) => {
  //     tx.type = "Sent";
  //   });
  //   //
  //   const mergedTxs = received.txs.concat(sent.txs);
  //   const filterByBlockHeight = mergedTxs.sort(function (a, b) {
  //     return a.height - b.height;
  //   });

  //   return filterByBlockHeight;
  // }

  // /**
  //  * @returns {Object}
  //  */
  // sortTxs(object, sentOrReceived) {
  //   object.txs.forEach((tx) => {
  //     tx.type = sentOrReceived;
  //   });

  //   const filterByBlockHeight = object.txs.sort(function (a, b) {
  //     return a.height - b.height;
  //   });

  //   return filterByBlockHeight;
  // }

  // /**
  //  * @returns {Object | undefined}
  //  */
  // async getAllTransactions(address) {
  //   let receivedTxs;
  //   try {
  //     receivedTxs = await this.getTxs(address, true);
  //   } catch (error) {
  //     console.error(error);
  //     return undefined;
  //   }

  //   let sentTxs;
  //   try {
  //     sentTxs = await this.getTxs(address, false);
  //   } catch (error) {
  //     console.error(error);
  //     return undefined;
  //   }

  //   if (receivedTxs === undefined && sentTxs === undefined) return undefined;

  //   // Check if both arrays are not empty
  //   if (
  //     receivedTxs &&
  //     receivedTxs.txs &&
  //     receivedTxs.txs.length > 0 &&
  //     sentTxs &&
  //     sentTxs.txs &&
  //     sentTxs.txs.length > 0
  //   ) {
  //     return this.mergeTxs(receivedTxs, sentTxs);
  //   } else if (receivedTxs && receivedTxs.txs && receivedTxs.txs.length > 0) {
  //     return this.sortTxs(receivedTxs, "Received");
  //   } else if (sentTxs && sentTxs.txs && sentTxs.txs.length > 0) {
  //     return this.sortTxs(sentTxs, "Sent");
  //   } else {
  //     return undefined;
  //   }
  // }

  // /**
  //  * @returns {Object[]}
  //  */
  // async getTxs(address, received) {
  //   const maxTxs = Number(this.config.maxTransactionListCount);
  //   // Retrieve received transactions
  //   let receivedTxs;

  //   try {
  //     receivedTxs = await this.gwClient.makeQuery(
  //       "getAccountTxs",
  //       address,
  //       received,
  //       false,
  //       1,
  //       maxTxs,
  //       "asc"
  //     );
  //   } catch (error) {
  //     console.log({ error });
  //     return undefined;
  //   }

  //   return receivedTxs;
  // }

  /**
   * @returns {string[]}
   */
  async getSupportedChains(height = 0) {
    try {
      const supportedchains = await this.gwClient.makeQuery(
        "getSupportedChains",
        height
      );
      return supportedchains;
    } catch (error) {
      console.error({ error });
      return undefined;
    }
  }

  /**
   * @returns {boolean}
   */
  validateAddress(address) {
    return Hex.validateAddress(address);
  }

  /**
   * @returns {boolean}
   */
  validatePrivateKey(privateKey) {
    return Hex.isHex(privateKey) && privateKey.length === 128;
  }

  /**
   * @returns {boolean}
   */
  typeGuard(object, type) {
    if (typeGuard(object, type)) {
      return true;
    }
    return false;
  }
}