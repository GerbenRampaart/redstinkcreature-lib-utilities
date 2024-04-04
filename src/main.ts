import { NestFactory } from '@nestjs/core';
import { PackageModule } from './services/package/package.module.ts';
import { AppPackageJsonService } from './services/package/package.service.ts';

async function bootstrap() {
	const app = await NestFactory.create(PackageModule);
	const pj = app.get(AppPackageJsonService);
	console.log(pj.product.pj.name);
	await app.listen(3000);
}
bootstrap();
