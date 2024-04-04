import { repl } from '@nestjs/core';
import { PackageModule } from '../services/package/package.module.ts';

async function replTest() {
	await repl(PackageModule);
}

replTest();
