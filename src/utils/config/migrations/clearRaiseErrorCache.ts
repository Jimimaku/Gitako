import { storageHelper } from 'utils/storageHelper'
import { Migration, onConfigOutdated } from '.'
import packageJson from '../../../../package.json'

// Run every time a new version is released.
export const migration: Migration = {
  version: packageJson.version,
  async migrate(version) {
    await onConfigOutdated(version, async () => {
      await storageHelper.set({ raiseErrorCache: [] })
    })
  },
}
