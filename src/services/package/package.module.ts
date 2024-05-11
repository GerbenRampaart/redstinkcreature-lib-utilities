import { Module } from '@nestjs/common';
import { PackageService } from './package.service.ts';
import { PathsService } from '../paths/paths.service.ts';

@Module({
	imports: [],
	providers: [
		PathsService,
		PackageService,
	],
	exports: [
		PathsService,
		PackageService,
	],
})
export class PackageModule {}
