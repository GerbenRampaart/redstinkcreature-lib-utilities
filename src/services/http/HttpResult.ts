import { AxiosError, type AxiosResponse } from 'axios';
import { type AxiosRequestConfigWithMetadata } from './AxiosRequestConfigWithMetadata.ts';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CurlHelper } from './curlarize.ts';
import { z } from 'zod';

/*

| ERR_BAD_OPTION_VALUE | Invalid or unsupported value provided in axios configuration. |
| ERR_BAD_OPTION | Invalid option provided in axios configuration. |
| ECONNABORTED | Request timed out due to exceeding timeout specified in axios configuration. |
| ETIMEDOUT | Request timed out due to exceeding default axios timelimit. |
| ERR_NETWORK | Network-related issue.
| ERR_FR_TOO_MANY_REDIRECTS | Request is redirected too many times; exceeds max redirects specified in axios configuration.
| ERR_DEPRECATED | Deprecated feature or method used in axios.
| ERR_BAD_RESPONSE | Response cannot be parsed properly or is in an unexpected format.
| ERR_BAD_REQUEST | Requested has unexpected format or missing required parameters. |
| ERR_CANCELED | Feature or method is canceled explicitly by the user.
| ERR_NOT_SUPPORT | Feature or method not supported in the current axios environment.
| ERR_INVALID_URL | Invalid URL provided for axios request.
*/

export class HttpResult<TResponseType, TBodyType = unknown> {
	constructor(
		public cfg: AxiosRequestConfigWithMetadata<TBodyType>,
		public response?: AxiosResponse<TResponseType, TBodyType>,
		public error?: AxiosError,
	) {
	}

	public get timedOut(): boolean {
		return this.error?.code === 'ETIMEDOUT' ||
			this.error?.code === 'ECONNABORTED';
	}

	public get canceled(): boolean {
		return this.error?.code === 'ERR_CANCELED';
	}

	public get elapsed(): number | undefined {
		return this.cfg.metadata?.elapsed;
	}

	public get curl(): string {
		const ch = new CurlHelper(this.cfg);
		return ch.generateCommand();
	}

	/**
	 * This will return true if:
	 * - There is a this.response object (there won't be when an exception occurred).
	 * - There is NO this.error object (there always is when an error occurred).
	 * - The response status is in the 200..299 range.
	 *
	 * otherwise false.
	 *
	 * In other words, this is always safe code:
	 *
	 * if (result.ok) {
	 *  // Your happy path code with result.response available
	 * }
	 */
	public get ok() {
		return (this.response && !this.error &&
			this.response.status >= 200 &&
			this.response.status < 300) ?? false;
	}

	/**
	 * This function is intended to be run without any side-effects if NO error occurred.
	 * Run this in case you want to throw a NestJs HttpException with the AxiosError serialized
	 * in there. You can use your own ErrorFilter to adjust it further.
	 *
	 * This will only throw an exception if this.ok is false and there is an error object (this.error).
	 * In other words, if the request went well, nothing will happen.
	 *
	 * if (result.ok) {
	 *  // Your happy path code
	 * }
	 *
	 * // Free to invoke this
	 * result.throwHttpExceptionIfError(HttpStatus.BAD_REQUEST); // throw exception (if any) and force a BAD_REQUEST
	 *
	 * @param forceStatus (optional)
	 * Override the status in the thrown HttpException with your own status. If not
	 * supplied, the function will try to get the http status from axiosResult.error.status,
	 * (essentialy re-throwing the http status the api you called returned), if not available, it
	 * defaults to 500.
	 *
	 * @param forceMessage (optional)
	 * Defaults to error.toJSON or 'Unhandled exception' if error is not available.
	 */
	public throwHttpExceptionIfError(
		forceStatus?: HttpStatus,
		forceMessage?: string,
	): void {
		if (this.error) {
			const status = forceStatus ?? this.error.status ?? 500;
			const msg = forceMessage ?? this.error.message ??
				'Unhandled exception';
			throw new HttpException(msg, status, {
				cause: this.error.toJSON(),
			});
		}
	}

	public throwIfNotValid(
		// deno-lint-ignore no-explicit-any
		schema: z.ZodObject<any>,
		status: HttpStatus,
		forceMessage?: string,
	) {
		this.throwHttpExceptionIfError(status, forceMessage);
		const result = schema.safeParse(this.response!.data);

		if (!result.success) {
			throw new HttpException(
				forceMessage ?? result.error.issues,
				status,
			);
		}
	}
}
