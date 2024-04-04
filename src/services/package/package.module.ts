import { Module } from '@nestjs/common';
import { AppPackageJsonService } from './package.service.ts';

@Module({
	imports: [
	],
	providers: [
		AppPackageJsonService,
	],
	exports: [
		AppPackageJsonService,
	],
})
export class PackageModule {}
