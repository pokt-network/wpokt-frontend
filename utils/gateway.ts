import Axios, { AxiosInstance } from "axios";
import { PoktErrors } from "./datasource";

/**
 * Http Adapter.
 * Configure your headers and what not in here.
 * Interceptors and Network Layer middlewares should come in here.
 */
export class AxiosProvider {
  http: AxiosInstance;

  constructor(baseURL: string, config: any) {
    this.http = Axios.create({
      baseURL,
      timeout: config.timeout || 100000,
      headers: config.headers,
    });
  }
}

/**
 * Http Control Layer.
 * Throw your http control logic in here, i.e: if error, if data, if 201.
 */
export class PocketQueriesController {
  provider: any = undefined;

  requests = {
    getBalance: (address: string, height: number) => ({
      url: "/v1/query/balance",
      method: "post",
      data: {
        address,
        height,
      },
    }),
    getTransaction: (id: string) => ({
      url: "/v1/query/tx",
      method: "post",
      data: {
        hash: id,
      },
    }),
    getApp: (address: string, height: number) => ({
      url: "/v1/query/app",
      method: "post",
      data: {
        address,
        height,
      },
    }),
    getNode: (address: string, height: number) => ({
      url: "/v1/query/node",
      method: "post",
      data: {
        address,
        height,
      },
    }),
    sendRawTx: (fromAddress: string, tx: any) => ({
      url: "/v1/client/rawtx",
      method: "post",
      data: {
        address: fromAddress,
        raw_hex_bytes: tx,
      },
    }),
    getSupportedChains: (height: number) => ({
      url: "/v1/query/supportedchains",
      method: "post",
      data: {
        height,
      },
    }),
  };

  use(provider: any) {
    this.provider = provider;
    return this;
  }

  // looks ugly with the ifs
  // but the gateway constantly responds with 200
  // and responds with errors in response.data
  // in a non-consistent form.
  parseSuccessfulResponse = (response: any) => {
    if (
      typeof response.data === "string" &&
      response.data.indexOf("Method Not Allowed") > -1
    ) {
      throw new Error("Method Not Allowed");
    }

    if (response.data.code && response.data.code !== 200) {
      throw response.data;
    }

    return response.data;
  };

  parseErrorResponse = (error: any) => {
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }

    if (typeof error === "string") {
      throw new Error(error);
    }

    throw error;
  };

  perform = async (requestName: string, ...args: any) => {
    if (!this.provider) {
      throw new Error("No provider set");
    }
    const reqConfig =
      typeof this.requests[requestName] === "function"
        ? this.requests[requestName](...args)
        : this.requests[requestName];

    const response = await this.provider.http
      .request(reqConfig)
      .then(this.parseSuccessfulResponse)
      .catch(this.parseErrorResponse);

    return response;
  };

  // does not really need to be bound to `this`, but keeping it for semantics' sake.
  // arguments explicit forwardong for clear signature lookup, avoid using `...args`
  _getBalance = (address: string, height: number) =>
    this.perform.call(this, "getBalance", address, height);
  _getTransaction = (id) => this.perform.call(this, "getTransaction", id);
  _getApp = (address: string, height: number) =>
    this.perform.call(this, "getApp", address, height);
  _getNode = (address: string, height: number) =>
    this.perform.call(this, "getNode", address, height);
  _sendRawTx = (fromAddress: string, tx: any) =>
    this.perform.call(this, "sendRawTx", fromAddress, tx);
  _getSupportedchains = (height: number) =>
    this.perform.call(this, "getSupportedChains", height);

  // For semantic separation, and for "ease of middlewaring" when necessary.
  // hook your processors to your cals in here
  query = {
    getBalance: this._getBalance,
    getTransaction: this._getTransaction,
    getApp: this._getApp,
    getNode: this._getNode,
    sendRawTx: async (fromAddress: string, tx: any) => {
      const request = this.processors.rawTx.processRequest({ fromAddress, tx });
      const rawResponse = await this._sendRawTx(
        request.addressHex,
        request.rawTxBytes
      );
      const response = this.processors.rawTx.processResponse(rawResponse);

      return response;
    },
    getSupportedChains: this._getSupportedchains,
  };

  // request/response processors
  processors = {
    rawTx: {
      processRequest: ({ fromAddress, tx }: any) => ({
        addressHex: fromAddress.toString("hex"),
        rawTxBytes: tx.toString("hex"),
      }),
      processResponse: (response: any) => response,
    },

    accountTxs: {
      processResponse: (response: any) => {
        const base64ToStr = (v: any) => Buffer.from(v, "base64").toString();
        const kvToStr = (kvObj: any) => ({
          key: base64ToStr(kvObj.key),
          value: base64ToStr(kvObj.value),
        });

        const mapEvents = (events: any[]) =>
          events
            ? events.map((e) => ({
                ...e,
                attributes: e.attributes.map(kvToStr),
              }))
            : [];

        const txs = response.txs.map((tx: any) => ({
          ...tx,
          tx_result: {
            ...tx.tx_result,
            events: mapEvents(tx.tx_result.events),
          },
        }));

        return { ...response, txs };
      },
    },
  };
}

/**
 * Exposes registered/allowed gateway queries.
 * This layer is added for gateway level logic control. i.e: custom errors and responses.
 */
export class GatewayClient {
  config: any;
  controller: PocketQueriesController;
  queries = [
    "getBalance",
    "getTransaction",
    "getApp",
    "getNode",
    "getAccountTxs",
    "sendRawTx",
    "getSupportedChains",
  ];


  constructor(httpProvider: any, requestsController: any, config: any) {
    this.controller = requestsController.use(httpProvider);
    this.config = config;
  }


  /**
   * @returns {BigInt}
   */
  async makeQuery(queryName: string, ...args: any) {
    if (!this.queries.includes(queryName)) {
      throw PoktErrors;
    }
    return await this.controller.query[queryName](...args);
  }
}

export const getGatewayClient = (baseUrl: string, config: any) => {
  const httpProvider = new AxiosProvider(baseUrl, config);
  const requestsCtrl = new PocketQueriesController();
  const gwClient = new GatewayClient(httpProvider, requestsCtrl, {
    baseUrl,
    ...config,
  });

  return gwClient;
};

