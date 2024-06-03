import { assertArrayIncludes, assertEquals } from '@std/assert';
import { AppConstantsService } from './app-constants.service.ts';

Deno.test({
	name: 'AppConstantsService.validDenoEnvs',
	permissions: {},
}, () => {
	assertArrayIncludes<string>(AppConstantsService.validEnvs, [
		'repl',
	]);
});

Deno.test({
	name: 'AppConstantsService.product',
	permissions: {
		read: true,
	},
}, async () => {
	const p = await AppConstantsService.product();
	assertEquals(p.name, '@redstinkcreature/lib-utilities');
});
