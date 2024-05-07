import { Test, TestingModule } from '@nestjs/testing';
import { AppPackageJsonService } from './package.service.ts';
import { PackageModule } from './package.module.ts';
import { assertExists, assertEquals} from 'std/assert';

Deno.test({
	name: 'PackageModule',
	permissions: {
		read: true,
	},
}, async (t: Deno.TestContext) => {
	let service: AppPackageJsonService;
	let module: TestingModule;

	await t.step('Create TestModule', async () => {
		module = await Test.createTestingModule({
			imports: [
				PackageModule,
			],
		}).compile();

		service = module.get<AppPackageJsonService>(AppPackageJsonService);
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
