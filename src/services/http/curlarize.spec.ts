import { type AxiosRequestConfig } from 'axios';
import { CurlHelper } from './curlarize.ts';
import { expect, test } from 'bun:test';

test('curlarize', () => {
	test('Create Module', () => {
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
		expect(
			com).toBe(
				'curl -i -v -L -X GET "http://test.com/bla?bla=bla" -H "Accept:test"',
			);
	});
});
