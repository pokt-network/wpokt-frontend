import {
  Pocket,
  Configuration,
  typeGuard,
  RpcError,
  CoinDenom,
  TxSignature,
  TransactionSender,
  ProtoTransactionSigner,
} from "@pokt-network/pocket-js";
// import { getGatewayClient } from "./gateway";
// import axios from "axios";
import { UPOKT, parsePokt } from "./pokt";
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
  gatewayUrl: `https://mainnet.gateway.pokt.network/v1/lb/${process.env.POKT_RPC_KEY}`,
  http: {
    timeout: 30000,
    headers: {},
  },
  chainId: 'mainnet',
  txFee: Number(parsePokt('0.01').toString()),
  maxTransactionListCount: 15,
  useLegacyCodec: true
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

    // this.gwClient = getGatewayClient(gatewayUrl, httpConfig);
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

    this.config = config;
  }

  /**
   * @returns {Number}
   */
  // async getBalance(address: string): Promise<number> {
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
  // async getPrice(): Promise<any> {
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
  // async getTx(txHash: string): Promise<any> {
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
  // async getApp(address: string): Promise<any> {
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
  // async getNode(address: string): Promise<any> {
  //   let node;
  //   try {
  //     node = await this.gwClient.makeQuery("getNode", address, 0);
  //   } catch (error) {
  //     console.log(error);
  //     return undefined;
  //   }

  //   return node;
  // }

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
      // Buffer.from(publicKey, "hex"),
      // Buffer.from(signature, "hex")
    );

    const transactionSender = new TransactionSender(
      this.__pocket,
      undefined,
      undefined,
      true
    );

    const itxSender = transactionSender.send(fromAddress, toAddress, amount);

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
      
      rawTxResponse = await fetch(`${this._gatewayUrl}/v1/client/rawtx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: rawTxOrError.address,
          raw_hex_bytes: rawTxOrError.txHex,
        })
      })
    } catch (error) {
      console.log(`Failed to send transaction with error: ${error}`);
      return new Error((error as Error).toString());
    }

    return rawTxResponse;
  }
}