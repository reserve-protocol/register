import { expect, test } from '../../fixtures/base'

test('Ask Reserve AI launcher drags without opening @smoke @mobile', async ({
  page,
}, testInfo) => {
  await page.goto('/')

  const launcher = page.getByTestId('reserve-chat-launcher')
  await expect(launcher).toBeVisible()
  const touch = testInfo.project.name === 'mobile'
  const cdp = touch ? await page.context().newCDPSession(page) : null
  const drag = async (
    from: { x: number; y: number },
    to: { x: number; y: number },
    cancel = false
  ) => {
    if (cdp) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [from],
      })
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [to],
      })
      await cdp.send('Input.dispatchTouchEvent', {
        type: cancel ? 'touchCancel' : 'touchEnd',
        touchPoints: [],
      })
      return
    }
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(to.x, to.y)
    await page.mouse.up()
  }

  await launcher.evaluate((element) => {
    element.addEventListener('pointerdown', (event) => {
      element.dataset.testPointerType = (event as PointerEvent).pointerType
    })
  })
  const start = await launcher.boundingBox()
  expect(start).not.toBeNull()
  const startCenter = {
    x: start!.x + start!.width / 2,
    y: start!.y + start!.height / 2,
  }
  await drag(startCenter, {
    x: startCenter.x - 120,
    y: startCenter.y - 80,
  })

  const moved = await launcher.boundingBox()
  expect(moved).not.toBeNull()
  expect(moved!.x).toBeLessThan(start!.x - 100)
  expect(moved!.y).toBeLessThan(start!.y - 60)
  await expect(launcher).toHaveAttribute(
    'data-test-pointer-type',
    touch ? 'touch' : 'mouse'
  )
  await expect(page.getByTestId('reserve-chat-panel')).toBeHidden()

  if (touch) {
    const movedCenter = {
      x: moved!.x + moved!.width / 2,
      y: moved!.y + moved!.height / 2,
    }
    await drag(
      movedCenter,
      { x: movedCenter.x - 24, y: movedCenter.y - 24 },
      true
    )
    await expect(launcher).not.toHaveClass(/rc-launcher-dragging/)
  }

  const current = await launcher.boundingBox()
  expect(current).not.toBeNull()
  await drag(
    {
      x: current!.x + current!.width / 2,
      y: current!.y + current!.height / 2,
    },
    { x: 0, y: 0 }
  )
  const bounded = await launcher.boundingBox()
  expect(bounded).not.toBeNull()
  expect(bounded!.x).toBe(0)
  expect(bounded!.y).toBe(0)

  await launcher.click()
  await expect(page.getByTestId('reserve-chat-panel')).toBeVisible()
  await page.locator('.rc-close').click()
  await expect(page.getByTestId('reserve-chat-panel')).toBeHidden()

  await launcher.focus()
  await page.keyboard.press('ArrowRight')
  const keyboardMoved = await launcher.boundingBox()
  expect(keyboardMoved).not.toBeNull()
  expect(keyboardMoved!.x).toBe(24)

  await launcher.press('Enter')
  await expect(page.getByTestId('reserve-chat-panel')).toBeVisible()
})
