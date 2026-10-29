import { createElement } from 'react'
import { IconButton } from 'storybook/internal/components'
import { addons, types, useChannel } from 'storybook/manager-api'
import { CLOSE_PREVIEW_DIALOG } from './preview-dialog-events'

addons.setConfig({
  layout: { showPanel: false },
})

const ClosePreviewTool = () => {
  const emit = useChannel({})
  return createElement(
    IconButton,
    {
      ariaLabel: 'Close preview dialog',
      onClick: () => emit(CLOSE_PREVIEW_DIALOG),
    },
    'Close preview'
  )
}

addons.register('register/dialog-preview', () => {
  addons.add('register/dialog-preview/close', {
    type: types.TOOL,
    title: 'Close preview dialog',
    match: ({ storyId }) =>
      [
        'components-feedback-and-overlays-dialog--docs',
        'components-feedback-and-overlays-dialog--eligibility',
        'components-feedback-and-overlays-dialog--long-content',
      ].includes(storyId ?? ''),
    render: ClosePreviewTool,
  })
})
