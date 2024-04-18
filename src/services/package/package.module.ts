import { Module } from '@nestjs/common';
import { AppPackageJsonService } from './package.service.ts';
import { PathsService } from '../paths/paths.service.ts';

@Module({
	imports: [],
	providers: [
		PathsService,
		AppPackageJsonService,
	],
	exports: [
		PathsService,
		AppPackageJsonService,
	],
})
export class PackageModule {}
