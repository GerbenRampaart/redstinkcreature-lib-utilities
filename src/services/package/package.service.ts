import { Injectable } from '@nestjs/common';
import { type PackagesType, type ProjectJson } from './PackageContext.ts';
import { PathsService } from '../paths/paths.service.ts';

@Injectable()
export class PackageService {
	constructor(
		private readonly p: PathsService,
	) {
		const pr = this.loadPj(this.p.productPath);

		this.product = {
			path: this.p.productPath,
			pj: pr,
		};
	}

	public product: PackagesType;

	private loadPj(p: string): ProjectJson {
		try {
			const pjContent = Deno.readTextFileSync(p);
			const pj = JSON.parse(pjContent);

			if (pj?.name && pj?.version) {
				return pj;
			} else {
				throw new Error(
					`No valid deno.json found in the project root. cwd was ${Deno.cwd()}`,
				);
			}
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}
