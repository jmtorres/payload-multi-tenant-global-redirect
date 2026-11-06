import config from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config })

const tenantA = await payload.create({ collection: 'tenants', data: { name: 'Tenant A' } })
await payload.create({ collection: 'tenants', data: { name: 'Tenant B' } })

await payload.create({
  collection: 'users',
  data: { email: 'admin@example.com', password: 'test', roles: ['super-admin'] },
})
await payload.create({
  collection: 'users',
  data: {
    email: 'editor@example.com',
    password: 'test',
    roles: ['user'],
    tenants: [{ tenant: tenantA.id }],
  },
})
const settings = await payload.create({
  collection: 'settings',
  data: { title: 'Tenant A settings', tenant: tenantA.id },
})

payload.logger.info(`Seeded tenant A ${tenantA.id}, settings ${settings.id}`)
process.exit(0)
