import type { CollectionConfig } from 'payload'

export const Settings: CollectionConfig = {
  slug: 'settings',
  admin: {
    useAsTitle: 'title',
  },
  fields: [{ name: 'title', type: 'text' }],
}
