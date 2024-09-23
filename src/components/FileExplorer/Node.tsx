import { useConfigs } from 'containers/ConfigsContext'
import { platform } from 'platforms'
import React, { useMemo, useRef } from 'react'
import { cx } from 'utils/cx'
import { cancelEvent } from 'utils/DOMHelper'
import { getFileIconURL, getFolderIconURL } from 'utils/parseIconMapCSV'
import { Icon } from '../Icon'

function getIconType(node: TreeNode) {
  switch (node.type) {
    case 'tree':
      return 'folder'
    case 'commit':
      return 'submodule'
    default:
      return node.name.replace(/.*\./, '.')
  }
}

type Props = {
  node: TreeNode
  onClick(event: React.MouseEvent<HTMLElement, MouseEvent>, node: TreeNode): void
  onFocus(event: React.FocusEvent<HTMLElement, Element>, node: TreeNode): void
  depth: number
  expanded: boolean
  focused: boolean
  loading: boolean
  renderActions?(node: TreeNode): React.ReactNode
  renderLabelText(node: TreeNode): React.ReactNode
  style?: React.CSSProperties
}

export const Node = React.memo(function Node({
  node,
  depth,
  expanded,
  focused,
  loading,
  renderActions,
  renderLabelText,
  style,
  onClick,
  onFocus,
}: Props) {
  const { compactFileTree: compact } = useConfigs().value
  const ref = useRef<HTMLDivElement>(null)
  return (
    <a
      href={node.url}
      onClick={event => onClick(event, node)}
      onFocus={event => onFocus(event, node)}
      className={cx(`node-item`, { focused, disabled: node.accessDenied, expanded, compact })}
      style={{ ...style, paddingLeft: `${10 + (compact ? 10 : 20) * depth}px` }}
      title={node.path}
      target={node.type === 'commit' ? '_blank' : undefined}
      rel="noopener noreferrer"
      {...(node.type === 'blob' ? platform.delegateFastRedirectAnchorProps?.({ node }) : null)}
    >
      <div className={'node-item-label'}>
        <NodeItemIcon node={node} open={expanded} loading={loading} />
        {renderLabelText(node)}
      </div>
      {renderActions && (
        <div
          ref={ref}
          className={'actions'}
          onClick={e => {
            // exclude elements mounted outside but still bubbles event through react to here
            if (e.target instanceof Element && ref.current?.contains(e.target)) cancelEvent(e)
          }}
        >
          {renderActions(node)}
        </div>
      )}
    </a>
  )
})

const NodeItemIcon = React.memo(function NodeItemIcon({
  node,
  open = false,
  loading,
}: {
  node: TreeNode
  open?: boolean
  loading?: boolean
}) {
  const { icons } = useConfigs().value

  const src = useMemo(
    () => (node.type === 'tree' ? getFolderIconURL(node, open) : getFileIconURL(node)),
    [node, open],
  )
  const iconType = useMemo(() => getIconType(node), [node])

  if (icons === 'native') return <Icon type={iconType} />
  return (
    <>
      <Icon
        className={'node-item-type-icon'}
        placeholder={node.type !== 'tree'}
        type={loading ? 'loading' : iconType}
      />
      {node.type === 'commit' ? (
        <Icon type={iconType} />
      ) : (
        <img alt={node.name} className={cx('node-item-icon', { dim: icons === 'dim' })} src={src} />
      )}
    </>
  )
})
