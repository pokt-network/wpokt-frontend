import {
  Pocket,
  Configuration,
  typeGuard,
  RpcError,
  CoinDenom,
  TxSignature,
  TransactionSender,
  ProtoTransactionSigner,
  UnlockedAccount,
} from "@pokt-network/pocket-js";
import { getGatewayClient } from "./gateway";
// import axios from "axios";
import { UPOKT, parsePokt } from "./pokt";
// import { createPocket } from './pocket';
// import { Config } from "./config";

export const PoktErrors = {
  ConfigErrors: {
    RequiredParam: (paramName: string) => `DataSourceConfigError: ${paramName} is required, but none was configured`,
  }
}

// export const dataSourceConfig = {
//   gatewayUrl: Config.GATEWAY_BASE_URL,
//   http: {
//     timeout: Config.HTTP_TIMEOUT,
//     headers: Config.HTTP_HEADERS !== "" ? JSON.parse(Config.HTTP_HEADERS) : {},
//   },
//   chainId: Config.CHAIN_ID,
//   txFee: Config.TX_FEE,
//   maxTransactionListCount: Config.MAX_TRANSACTION_LIST_COUNT,
//   useLegacyCodec: Config.USE_LEGACY_CODEC === "false" ? false : true
// }

export const dataSourceConfig = {
  gatewayUrl: `https://mainnet.gateway.pokt.network/v1/${process.env.POKT_RPC_KEY}`,
  http: {
    timeout: '0',
    headers: {"Content-Type": "application/json"},
  },
  chainId: 'mainnet',
  blockTime: '900000',
  txFee: parsePokt('0.01').toString(),
  maxTransactionListCount: '100',
  useLegacyCodec: false
}

export const getDataSource = () => new DataSource(dataSourceConfig);

export class DataSource {
  gwClient: any;
  _gatewayUrl: string;
  __pocket: Pocket;
  config: any;

  constructor(config: any) {
    const gatewayUrl = config ? config.gatewayUrl || "" : "";
    const httpConfig = config ? config.http || {} : {};

    if (gatewayUrl === "") {
      throw PoktErrors.ConfigErrors.RequiredParam("gatewayUrl");
    }

    if (Object.keys(httpConfig).length === 0) {
      console.warn(PoktErrors.ConfigErrors.RequiredParam("http"));
    }

    this.gwClient = getGatewayClient(gatewayUrl, httpConfig);
    this._gatewayUrl = gatewayUrl;

    const pocketClientConfiguration = new Configuration(
      1,
      1000,
      0,
      20000,
      undefined,
      undefined,
      Number(config.blockTime || 0),
      undefined,
      false,
      false,
      config.useLegacyCodec
    );

    this.__pocket = new Pocket([new URL(gatewayUrl)], undefined, pocketClientConfiguration);
    // this.__pocket = createPocket(config);

    this.config = config;
  }

  async sendTransactionFromLedger(publicKey: Buffer, signature: Buffer, tx: any): Promise<Response | Error> {
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
      publicKey,
      signature
    );

    const transactionSender = new TransactionSender(
      this.__pocket,
      undefined,
      undefined,
      true
    );

    const itxSender = transactionSender.send(fromAddress, toAddress, amount);
    console.log({ itxSender })

    const unsignedTransaction = itxSender.createUnsignedTransaction(
      chainID,
      fee[0].amount,
      entropy,
      CoinDenom.Upokt,
      memo
    );

    if (typeGuard(unsignedTransaction, RpcError)) {
      console.log(
        `Failed to process transaction with error: ${unsignedTransaction}`
      );
      return new Error(unsignedTransaction.message);
    }

    const { bytesToSign, stdTxMsgObj } = unsignedTransaction;
    const rawTxOrError = ProtoTransactionSigner.signTransaction(
      stdTxMsgObj,
      bytesToSign,
      txSignature
    );
    console.log({
      rawTxOrError,
      stdTxMsgObj,
      bytesToSign,
      txSignature
    })
    if (typeGuard(rawTxOrError, RpcError)) {
      console.log(`Failed to process transaction with error: ${rawTxOrError}`);
      return new Error(rawTxOrError.message);
    }
    let rawTxResponse;
    try {
      rawTxResponse = await this.gwClient.makeQuery(
        "sendRawTx",
        rawTxOrError.address,
        rawTxOrError.txHex
      );
      
      // rawTxResponse = await fetch(`${this._gatewayUrl}/v1/client/rawtx`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     address: rawTxOrError.address,
      //     raw_hex_bytes: rawTxOrError.txHex,
      //   })
      // })

      // rawTxResponse = await fetch(`/api/tx`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     address: rawTxOrError.address,
      //     raw_hex_bytes: rawTxOrError.txHex,
      //   })
      // })
    } catch (error: any) {
      console.log(`Failed to send transaction with error: ${error.raw_log}`);
      return new Error(error.raw_log);
    }

    return rawTxResponse;
  }
}