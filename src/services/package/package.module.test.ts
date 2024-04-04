import { Test, TestingModule } from '@nestjs/testing';
import { AppPackageJsonService } from './package.service.ts';
import { PackageModule } from './package.module.ts';

describe('PackageModule', () => {
	let service: AppPackageJsonService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				PackageModule,
			],
			providers: [
			],
		}).compile();

		service = module.get<AppPackageJsonService>(AppPackageJsonService);
	});

	it('should be defined', () => {
		expect(AppPackageJsonService).toBeDefined();
	});

	it('should be @redstinkcreature/lib-utilities', () => {
		expect(service.product.pj.name).toBe('@redstinkcreature/lib-utilities');
	});
});
