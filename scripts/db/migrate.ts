// npm run db:migrate — spielt die Migrationen aus drizzle/ ein (idempotent).
import './env';
import { migriere } from '../../lib/db/migrieren';

migriere()
  .then((r) => {
    console.log(`Migrationen: ${r}`);
    if (r !== 'ok') process.exitCode = 1;
  })
  .catch((e) => {
    console.error('Migration fehlgeschlagen:', (e as Error).message);
    process.exitCode = 1;
  });
