import { Test, TestingModule } from '@nestjs/testing';
import { RawValueService } from './raw/raw-value.service.ts';
import { MiscModule } from './misc.module.ts';
import { PathsService } from './paths/paths.service.ts';

describe('MiscModule', () => {
	let rawValue: RawValueService;
	//let appPackageJson: AppPackageJsonService;
	let paths: PathsService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				MiscModule,
			],
			providers: [
				RawValueService,
				PathsService,
				//AppPackageJsonService
			],
		}).compile();

		rawValue = module.get<RawValueService>(RawValueService);
		paths = module.get<PathsService>(PathsService);
		//appPackageJson = await module.resolve<AppPackageJsonService>(AppPackageJsonService);
	});

	it('should be defined', () => {
		expect(rawValue).toBeDefined();
		//expect(appPackageJson).toBeDefined();
		expect(paths).toBeDefined();
	});

	it('should be package.json', () => {
		expect(paths.productPath).toBe('package.json');
	});

	it('should contain info', () => {
		expect(RawValueService.validLogLevels).toContain('info');
	});
});
