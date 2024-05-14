import { Test, TestingModule } from '@nestjs/testing';
import { PackageService } from './package.service.ts';
import { PackageModule } from './package.module.ts';
import { assertEquals, assertExists } from 'std/assert';

Deno.test({
	name: 'PackageModule',
	permissions: {
		read: true,
	},
}, async (t: Deno.TestContext) => {
	let service: PackageService;
	let module: TestingModule;

	await t.step('Create TestModule', async () => {
		module = await Test.createTestingModule({
			imports: [
				PackageModule,
			],
		}).compile();

		service = module.get(PackageService);
	});

	await t.step('Check if service is defined', () => {
		assertExists(service);
	});

	await t.step('Check if service is defined', () => {
		assertEquals(
			service.product.pj.name,
			'@redstinkcreature/lib-utilities',
		);
	});

	await t.step('Close TestModule', async () => {
		await module.close();
	});
});
