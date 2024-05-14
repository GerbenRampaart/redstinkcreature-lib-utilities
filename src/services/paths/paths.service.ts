import { Injectable } from '@nestjs/common';
import { globSync } from 'glob';
import type { AppLoggerService } from '../logger/app-logger.service.ts';
import { homedir } from 'node:os';

@Injectable()
export class PathsService {
	constructor() {
		// Example output: [ 'deno.json', 'src/services/paths/deno.json' ]
		const allProjectPackageJson = globSync('**/deno.json', {
			ignore: 'node_modules/**',
			cwd: Deno.cwd(),
		});

		const product = allProjectPackageJson.find((p) => p === 'deno.json');

		// We see the root deno.json as the product deno.json.
		// If that doesn't exist we're very confused.
		if (!product) {
			throw new Error(
				`No product deno.json found in the project root. cwd was ${Deno.cwd()}`,
			);
		}

		// We're looking for all lib packages which are dependencies in the project.
		// Those provide useful information for the logger and other services.
		this.productPath = product;
		this.libPaths = globSync(
			'node_modules/**/@redstinkcreature/lib-*/deno.json',
			{
				cwd: Deno.cwd(),
			},
		);
	}

	public productPath: string;
	public libPaths: string[];

	public get paths(): {
		n: string;
		p: string;
	}[] {
		return [
			{
				n: 'productPath',
				p: this.productPath,
			},
			{
				n: 'cwd',
				p: Deno.cwd(),
			},
			{
				n: 'import.meta.dirname',
				p: import.meta.dirname ?? '?',
			},
			{
				n: 'import.meta.filename',
				p: import.meta.filename ?? '?',
			},
			{
				n: 'homedir()',
				p: homedir(),
			},
			...this.libPaths.map((p, i) => {
				const n = `libPaths[${i}]`;
				return {
					n,
					p,
				};
			}),
		];
	}

	public logPaths(l: AppLoggerService): void {
		l.info(`---------- PATHS ----------`);
		this.paths.forEach((p) => l.log(`${p.n}: ${p.p}`));
		l.info(`//-------- PATHS ----------`);
	}
}
