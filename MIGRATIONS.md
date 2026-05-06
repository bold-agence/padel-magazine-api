## Migrations TypeORM (prod)

### Principes

- **Dev**: vous pouvez garder `synchronize` actif (auto-sync) pour itérer rapidement.
- **Prod**: **ne pas** utiliser `synchronize`. On applique **uniquement** des migrations.

La prod est détectée via `NODE_ENV=production`.

### Scripts

- **Générer une migration (dev)**:

```bash
npm run migration:generate
```

Cela crée un fichier dans `src/database/migrations/`.

- **Appliquer les migrations (prod / CI / déploiement)**:

```bash
npm run migration:run
```

- **Revenir en arrière (si nécessaire)**:

```bash
npm run migration:revert
```

### Options prod

Par défaut, on recommande d’exécuter les migrations **en étape de déploiement** via `npm run migration:run`.

Si vous préférez exécuter automatiquement au démarrage, vous pouvez activer:

- `TYPEORM_MIGRATIONS_RUN=true`

Avec `NODE_ENV=production`, cela déclenche `migrationsRun` côté TypeORM au boot (voir `src/database/database.module.ts`).

