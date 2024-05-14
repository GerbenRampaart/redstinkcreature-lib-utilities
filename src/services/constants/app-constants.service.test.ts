import { assertArrayIncludes } from 'std/assert';
import { AppConstantsService } from './app-constants.service.ts';

Deno.test({
	name: 'AppConstantsService',
	permissions: {},
}, () => {
	assertArrayIncludes<string>(AppConstantsService.validDenoEnvs, ['repl']);
});
