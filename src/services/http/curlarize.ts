import axios, { type AxiosRequestConfig, type AxiosInstance } from 'axios';
/**
 * This is almost exclusively used for logging (in debug), the curl of the axios
 * request we're doing, we found that to be very useful.
 *
 * https://www.npmjs.com/package/axios-curlirize?activeTab=code
 */
export class CurlHelper {
	constructor(
		public cfg: AxiosRequestConfig,
	) {
		this.method = this.cfg.method ?? 'GET';
		this.instance = axios.create(cfg);
	}

	private method: string;
	private instance: AxiosInstance;

	getHeaders(): string {
		let curlHeaders = '';

		if (this.cfg.headers) {
			for (const property in this.cfg.headers) {
				const header = `${property}:${this.cfg.headers[property]}`;
				curlHeaders = `${curlHeaders} -H "${header}"`;
			}
		}

		return curlHeaders.trim();
	}

	getBody(): string {
		const j = JSON.stringify(this.cfg.data);

		if (j) {
			return `--data '${j}'`;
		}

		return '';
	}

	/**
	 * https://gist.github.com/eneko/dc2d8edd9a4b25c5b0725dd123f98b10
	 * -i Include protocol response headers in the output
	 * -v Make the operation more talkative
	 * -L Follow redirects
	 * -X Specify request command to use
	 * @returns
	 */
	generateCommand(): string {
		try {
			return `curl -i -v -L -X ${this.method.toUpperCase()} "${this.instance.getUri(this.cfg)
				}" ${this.getHeaders()} ${this.getBody()}`
				.trim()
				.replace(/\s{2,}/g, ' ');
		} catch (err: unknown) {
			// At no point can the curlarize class ever throw an error.
			return String(err);
		}
	}
}
