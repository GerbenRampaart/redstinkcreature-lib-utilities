import { test, expect} from 'bun:test';
import { AppConstantsService } from './app-constants.service.ts';

test('AppConstantsService.validEnvs', () => {
	expect(AppConstantsService.validEnvs).toContain('repl');
});

test('AppConstantsService.product',

async () => {
	const p = await AppConstantsService.product();
	expect(p.name).toBe('@redstinkcreature/lib-utilities');
});
