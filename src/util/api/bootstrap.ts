import { api } from './api.ts';

(async () => {
	const app = await api();
	await app.listen(process.env['PORT'] ?? 3000);
})();
