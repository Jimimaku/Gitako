import { SimpleConfigFieldCheckbox } from 'components/settings/SimpleConfigField/Checkbox'
import { useConfigs } from 'containers/ConfigsContext'
import React from 'react'
import { subIO } from 'utils/general'
import { KeyboardShortcutSetting } from './KeyboardShortcutSetting'
import { SettingsSection } from './SettingsSection'
import { SimpleConfigFieldSelect } from './SimpleConfigField/SelectInput'

export function SidebarSettings() {
  const { sidebarToggleMode } = useConfigs().value

  return (
    <SettingsSection title={'Sidebar'}>
      <KeyboardShortcutSetting
        label={'Keyboard shortcut for toggle sidebar'}
        {...subIO(useConfigs(), 'shortcut')}
      />
      <KeyboardShortcutSetting
        label={'Keyboard shortcut for focus search input'}
        {...subIO(useConfigs(), 'focusSearchInputShortcut')}
      />
      <SimpleConfigFieldSelect
        field={{
          key: 'sidebarPlacement',
          label: 'Sidebar placement',
          tooltip: 'Change the position of the sidebar',
        }}
        options={[
          {
            key: 'left',
            value: 'left',
            label: 'Left',
          },
          {
            key: 'right',
            value: 'right',
            label: 'Right (*experimental)',
          },
        ]}
      />
      <SimpleConfigFieldCheckbox
        field={{
          key: 'intelligentToggle',
          label: 'Auto expand',
          disabled: sidebarToggleMode === 'float',
          tooltip: `Gitako will expand when exploring source files, pull requests, etc. And collapse otherwise.${
            sidebarToggleMode === 'float' ? '\nNow disabled as sidebar is in float mode.' : ''
          }`,
          overwrite: {
            value: enabled => (sidebarToggleMode === 'float' ? false : enabled === null),
            onChange: checked => (checked ? null : true),
          },
        }}
      />
    </SettingsSection>
  )
}
