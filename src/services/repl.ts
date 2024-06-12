import { repl } from '@nestjs/core';
import { LibUtilitiesModule } from '../lib-utilities.module.ts';

// https://docs.nestjs.com/recipes/repl#native-functions
async function replTest() {
	await repl(LibUtilitiesModule.register());
}

await replTest();
