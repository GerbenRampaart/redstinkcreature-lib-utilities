import { type AxiosRequestConfig } from 'axios';
import { CurlHelper } from './curlarize.ts';

describe('curlarize', () => {
	it('should be defined', () => {
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

		expect(com).toBeDefined();
	});
});
