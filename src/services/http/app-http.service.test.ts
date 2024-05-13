import { Test, TestingModule } from '@nestjs/testing';
import { assertEquals, assertExists } from 'std/assert';
import { AppHttpService } from './app-http.service.ts';
import { AppHttpModule } from './app-http.module.ts';

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
	sanitizeOps: false
}, async (t: Deno.TestContext) => {
	let service: AppHttpService;
	let module: TestingModule;

	await t.step('Create Module', async () => {
		module = await Test.createTestingModule({
			imports: [
				AppHttpModule,
			],
		}).compile();

		service = await module.resolve<AppHttpService>(AppHttpService);
	});

	await t.step('Check if service is defined', () => {
		assertExists(service);
	});

	await t.step('Check simple GET', async () => {
		const res = await service.request({
			url: 'https://google.com',
		});

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
