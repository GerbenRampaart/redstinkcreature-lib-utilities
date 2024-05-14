import { type AxiosRequestConfig } from 'axios';
import { CurlHelper } from './curlarize.ts';
import { assertEquals } from 'std/assert';

Deno.test({
	name: 'curlarize',
	permissions: {},
}, async (t: Deno.TestContext) => {
	await t.step('Create Module', () => {
		const cfg: AxiosRequestConfig = {
			url: 'http://test.com/bla',
			headers: {
				'Accept': 'test',
			},
			params: { bla: 'bla' },
		};

		const c = new CurlHelper(
			cfg,
		);

		const com = c.generateCommand();
		assertEquals(
			com,
			'curl -i -v -L -X GET "http://test.com/bla?bla=bla" -H "Accept:test"',
		);
	});
});
