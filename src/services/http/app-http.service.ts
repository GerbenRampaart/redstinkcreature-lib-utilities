import { AppLoggerService } from '../logger/app-logger.service.ts';
import { HttpResult } from './HttpResult.ts';
import { isNativeError } from 'node:util/types';
import {
	type AxiosRequestConfigWithMetadata,
	type InternalAxiosRequestConfigWithMetadata,
	type Metadata,
} from './AxiosRequestConfigWithMetadata.ts';
import { AppConstantsService } from '../constants/app-constants.service.ts';
import { hrtime } from 'node:process';
import { Injectable, Scope } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { isAxiosError, AxiosError, type AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable({
	// Transient providers are not shared across consumers.
	// Each consumer that injects a transient provider will receive a new, dedicated instance.
	// https://docs.nestjs.com/fundamentals/injection-scopes
	scope: Scope.TRANSIENT,
})
export class AppHttpService {
	constructor(
		private readonly l: AppLoggerService,
		private readonly http: HttpService,
	) {
		const timeout = 30000;
		http.axiosRef.defaults.timeout = timeout;

		this.l.debug(
			`If no timeout is provided in the request(cfg), the default timeout is ${timeout}ms.`,
		);

		http.axiosRef.interceptors.request.use(
			(cfg: InternalAxiosRequestConfigWithMetadata<unknown>) => {
				cfg.metadata = cfg.metadata || {};
				cfg.metadata.start = hrtime();
				cfg.metadata.startDate = new Date();

				l.info({
					method: cfg.method,
					url: cfg.url,
					headers: cfg.headers,
					startDate: cfg.metadata.startDate,
					correlationId: cfg.metadata.correlationId,
					requestId: cfg.metadata.requestId,
				});

				this.setContext(cfg.metadata, cfg);

				return cfg;
			},
		);

		http.axiosRef.interceptors.response.use((res) => {
			const cfg = res.config as InternalAxiosRequestConfigWithMetadata<
				unknown
			>;
			cfg.metadata = cfg.metadata || {};
			cfg.metadata.endDate = new Date();

			if (cfg.metadata.start !== undefined) {
				cfg.metadata.end = hrtime(cfg.metadata.start);

				// (just for reference I'm including the copilot explanation of the next line of code)
				/*
		  This line of code calculates the elapsed time in milliseconds.
		  The end variable is an array with two numbers,
		  representing the high-resolution real time from process.hrtime().
		  The first number end[0] is in seconds, and the second number end[1] is in nanoseconds.

		  (end[0] * 1000) converts the seconds to milliseconds.
		  (end[1] / 1000000) converts the nanoseconds to milliseconds
		  (since 1 millisecond is 1,000,000 nanoseconds).

		  Adding these two values together gives the total elapsed time in milliseconds.
		  Finally, Math.round() is used to round this value to the nearest whole number,
		  since the time in milliseconds is usually represented as an integer.
		*/
				if (cfg.metadata.end !== undefined) {
					cfg.metadata.elapsed = Math.round(
						(cfg.metadata.end[0] * 1e3) +
						(cfg.metadata.end[1] * 1e-6),
					);
				}
			}

			this.setContext(cfg.metadata, res);

			res.headers[
				AppConstantsService.libUtilitiesConstants.headers.responseTime
			] = cfg.metadata.elapsed;

			// Note that startDate and endDate are not as precise as the elapsed time.
			l.log({
				method: res.config.method,
				url: res.config.url,
				headers: res.config.headers,
				status: res.status,
				startDate: cfg.metadata.startDate,
				endDate: cfg.metadata.endDate,
				elapsed: cfg.metadata.elapsed ?? '?',
				correlationId: cfg.metadata.correlationId,
				requestId: cfg.metadata.requestId,
			});

			return res;
		});
	}

	private setContext(m: Metadata, ctx: { headers: Record<string, unknown> }) {
		if (m.correlationId) {
			ctx.headers[
				AppConstantsService.libUtilitiesConstants.headers.correlationId
			] = m.correlationId;
		}

		if (m.requestId) {
			ctx.headers[
				AppConstantsService.libUtilitiesConstants.headers.requestId
			] = m.requestId;
		}
	}

	public async request<TResponseType, TBody>(
		cfg: AxiosRequestConfigWithMetadata<TBody>,
		correlationId: string = crypto.randomUUID(),
		requestId: string = crypto.randomUUID(),
	): Promise<
		HttpResult<
			TResponseType,
			TBody
		>
	> {
		cfg.metadata = cfg.metadata || {};
		cfg.metadata.correlationId = correlationId;
		cfg.metadata.requestId = requestId;

		cfg.validateStatus = () => true;

		let response: AxiosResponse<TResponseType, TBody> | undefined =
			undefined;
		let error: AxiosError<TResponseType, TBody> | undefined = undefined;

		try {
			response = await lastValueFrom(
				this.http.request<TResponseType>({
					...cfg,
				}),
			);
		} catch (err: unknown) {
			// https://github.com/axios/axios/blob/d844227411263fab39d447442879112f8b0c8de5/README.md?plain=1#L614
			if (isAxiosError(err)) {
				error = err;
			} else if (isNativeError(err) && err instanceof Error) {
				error = new AxiosError<TResponseType, TBody>(err.message);
				error.name = err.name;
				error.cause = err;
				error.stack = err.stack;
			} else {
				error = new AxiosError<TResponseType, TBody>(String(err));
			}
		}

		return new HttpResult<TResponseType, TBody>(cfg, response, error);
	}
}
