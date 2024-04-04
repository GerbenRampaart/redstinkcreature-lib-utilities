import { type PackageJson } from 'type-fest';

export type PackagesType = {
	path: string;
	pj: PackageJson;
};

export interface PackageJsonContext {
	product: PackagesType;
	packages: PackagesType[];
}
