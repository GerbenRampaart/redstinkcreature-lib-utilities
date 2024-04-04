import { Module } from '@nestjs/common';
import { RawValueService } from './raw/raw-value.service.ts';
import { PathsService } from './paths/paths.service.ts';

/**
 * The misc module CAN NOT have outside dependencies.
 */
@Module({
	imports: [
		// KEEP EMPTY !!!!
	],
	providers: [
		RawValueService,
		PathsService,
	],
	exports: [
		RawValueService,
		PathsService,
	],
})
export class MiscModule {}
