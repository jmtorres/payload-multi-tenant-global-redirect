import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type Config } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Media } from './collections/Media'
import { Settings } from './collections/Settings'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * WORKAROUND=1 also passes the prop names GlobalViewRedirect actually reads
 * (`tenantArrayFieldName` / `tenantArrayTenantFieldName`, no "s").
 */
const globalViewRedirectWorkaround = (config: Config): Config => {
  if (process.env.WORKAROUND !== '1') return config
  for (const action of config.admin?.components?.actions ?? []) {
    if (
      typeof action === 'object' &&
      action.path === '@payloadcms/plugin-multi-tenant/rsc#GlobalViewRedirect'
    ) {
      action.serverProps = {
        ...action.serverProps,
        tenantArrayFieldName: 'tenants',
        tenantArrayTenantFieldName: 'tenant',
      }
    }
  }
  return config
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Tenants, Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    multiTenantPlugin({
      collections: {
        settings: { isGlobal: true },
      },
      userHasAccessToAllTenants: (user) => Boolean(user?.roles?.includes('super-admin')),
    }),
    globalViewRedirectWorkaround,
  ],
})
