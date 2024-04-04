import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { type PackagesType } from './PackageContext.ts';
import { type PackageJson } from 'type-fest';
import type { PathsService } from '../misc/paths/paths.service.ts';

@Injectable()
export class AppPackageJsonService {
	constructor(
		private readonly p: PathsService,
	) {
		const pr = this.loadPj(this.p.productPath);

		if (!pr) {
			throw new Error(
				`No product package.json found in the project root. cwd was ${process.cwd()}`,
			);
		}

		this.product = {
			path: this.p.productPath,
			pj: pr,
		};

		for (const p of this.p.libPaths) {
			const pj = this.loadPj(p);

			if (pj) {
				this.packages.push({
					path: p,
					pj,
				});
			}
		}
	}

	public product: PackagesType;
	public packages: PackagesType[] = [];

	private loadPj(p: string): PackageJson | undefined {
		if (existsSync(p)) {
			const pjContent = readFileSync(p, {
				encoding: 'utf-8',
			});

			try {
				const pj = JSON.parse(pjContent);

				if (pj?.name && pj?.version) {
					return pj;
				}

				return undefined;
			} catch (err) {
				console.error(err);
				return undefined;
			}
		}
	}
}
