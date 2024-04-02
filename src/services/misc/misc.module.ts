import { Module } from '@nestjs/common';

/**
 * The misc module CAN NOT have outside dependencies.
 * All services provided here either need no dependencies or depend on each other.
 */
@Module({
	imports: [
		// KEEP EMPTY !!!!
	],
	providers: [
		AppLoggerService,
	],
	exports: [
		AppLoggerService,
	],
})
export class AppLoggerModule { }
