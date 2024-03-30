import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export class CurlHelper {
  constructor(
    public cfg: AxiosRequestConfig,
  ) {
    this.method = this.cfg.method || "GET";
    this.instance = axios.create(cfg);
  }

  private method: string;
  private instance: AxiosInstance;

  getHeaders() {
    let curlHeaders = "";

    if (this.cfg.headers) {
      for (let property in this.cfg.headers) {
        let header = `${property}:${this.cfg.headers[property]}`;
        curlHeaders = `${curlHeaders} -H "${header}"`;
      }
    }

    return curlHeaders.trim();
  }

  getBody() {
    const j = JSON.stringify(this.cfg.data);

    if (j) {
      return `--data '${j}'`;
    }

    return "";
  }

  generateCommand(): string {
    try {
      return `curl -i -v -L -X ${this.method.toUpperCase()} "${
        this.instance.getUri(this.cfg)
      }" ${this.getHeaders()} ${this.getBody()}`
        .trim()
        .replace(/\s{2,}/g, " ");
    } catch (err: any) {
      // At no point can the curlarize class ever throw an error.
      return err.message ? err.message : "unknown error";
    }
  }
}
