import { AppConstantsService } from './app-constants.service';

describe('AppConstantsService', () => {
	it('should contain repl', () => {
		expect(AppConstantsService.validNodeEnvs).toContain('repl');
	});
});
