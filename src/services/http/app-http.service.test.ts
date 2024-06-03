import { Test, TestingModule } from '@nestjs/testing';
import { assertEquals, assertExists } from 'std/assert';
import { AppHttpService } from './app-http.service.ts';
import { AppHttpModule } from './app-http.module.ts';
import { AppConfigModule } from '../config/app-config.module.ts';
import { AppConfigService } from '../config/app-config.service.ts';
import z from 'zod';
import { AxiosRequestConfigWithMetadata } from './AxiosRequestConfigWithMetadata.ts';
import { HttpsProxyAgent } from 'https-proxy-agent';

/*
	sanitizeResources: false,
	sanitizeOps: false

Prevents the following errors:

Leaks detected:
  - "fetchCancelHandle" was created during the test, but not cleaned up during the test. Close the resource before the end of the test.
  - An HTTP client was created during the test, but not closed during the test. Close the HTTP client by calling `httpClient.close()`.
  - An async operation to send a HTTP request was started in this test, but never completed. This is often caused by not awaiting the result of a `fetch` call.
To get more details where leaks occurred, run again with the --trace-leaks flag.

These errors only occur if an AxiosError is thrown because a timeout was exceeded. Somehow it doesn't fully
close the request. TODO: research some more.
*/

Deno.test({
	name: 'AppHttpModule',
	permissions: {
		read: true,
		net: true,
		env: true,
		sys: true,
	},
	sanitizeResources: false,
	sanitizeOps: false,
}, async (t: Deno.TestContext) => {
	let service: AppHttpService;
	let module: TestingModule;

	const appSchema = z.object({
		HTTPS_PROXY: z.string().optional(),
	});

	type AppSchemaType = z.infer<typeof appSchema>;

	let configService: AppConfigService<AppSchemaType>;

	await t.step('Create Module', async () => {
		module = await Test.createTestingModule({
			imports: [
				AppHttpModule,
				AppConfigModule.registerAsync({
					useDotEnvEnvironment: true,
					useDotEnvDefaults: false,
				}),
			],
		}).compile();

		// Without init(), no lifecycle events are fired, like onModuleInit.
		await module.init();

		service = await module.resolve<AppHttpService>(AppHttpService);
		configService = module.get(AppConfigService<AppSchemaType>);
	});

	await t.step('Check if service is defined', () => {
		assertExists(service);
	});

	await t.step('Check simple GET', async () => {
		let o: AxiosRequestConfigWithMetadata<unknown> = {
			url: 'https://google.com',
		};

		const proxy = configService.get('HTTPS_PROXY');

		if (proxy) {
			o = {
				...o,
				httpsAgent: new HttpsProxyAgent(proxy),
				httpAgent: new HttpsProxyAgent(proxy),
				proxy: false,
			};
		}

		const res = await service.request(o);

		assertEquals(res.ok, true);
	});

	await t.step('Check timeout', async () => {
		const res = await service.request({
			url: 'https://google.com',
			timeout: 10,
		});

		assertEquals(res.ok, false);
		assertEquals(res.timedOut, true);
	});

	await t.step('Close TestModule', async () => {
		await module.close();
	});
});
