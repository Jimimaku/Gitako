import 'webext-dynamic-content-scripts'
import addPermissionToggle from 'webext-permission-toggle'

addPermissionToggle({
  title: 'Enable Gitako on this domain',
  reloadOnSuccess: 'Refresh to activate Gitako?',
})
