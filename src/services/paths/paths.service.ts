import { Injectable } from '@nestjs/common';
import { path as arp } from 'app-root-path';
import { globSync } from 'glob';
import type { AppLoggerService } from '../logger/app-logger.service.ts';

@Injectable()
export class PathsService {
	constructor() {
		// Example output: [ 'package.json', 'src/services/paths/package.json' ]
		const allProjectPackageJson = globSync('**/package.json', {
			ignore: 'node_modules/**',
			cwd: arp,
		});

		// We see the root package.json as the product package.json.
		// If that doesn't exist we're very confused.
		const productPackageJson = allProjectPackageJson.find((p) =>
			p === 'package.json'
		);

		if (!productPackageJson) {
			throw new Error(
				`No product package.json found in the project root. cwd was ${process.cwd()}`,
			);
		}

		// We're looking for all lib packages which are dependencies in the project.
		// Those provide useful information for the logger and other services.
		this.productPath = productPackageJson;
		this.libPaths = globSync(
			'node_modules/@redstinkcreature/lib-*/package.json',
			{
				cwd: arp,
			},
		);
	}

	public productPath: string;
	public libPaths: string[];

	public get paths(): { 
		n: string; 
		p: string 
	} [] {
		return [
			{
				n: 'productPath',
				p: this.productPath,
			},
			{
				n: 'app-root-path',
				p: arp,
			},
			{
				n: 'cwd',
				p: process.cwd(),
			},
			{
				n: 'import.meta.path',
				p: import.meta.path,
			},
			{
				n: 'import.meta.dir',
				p: import.meta.dir,
			},
			{
				n: 'import.meta.file',
				p: import.meta.file,
			},
			{
				n: '__dirname',
				p: __dirname,
			},
			{
				n: '__filename',
				p: __filename,
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
		this.paths.forEach((p) => l.log(`${p.n}: ${p.p}`));
	}
}
