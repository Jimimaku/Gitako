export async function expectToResolve<T>(promise: Promise<T>) {
  const pass = jest.fn()
  await promise.then(pass)
  expect(pass).toHaveBeenCalled()
}

export async function expectToReject<T>(promise: Promise<T>) {
  const pass = jest.fn()
  await promise.catch(pass)
  expect(pass).toHaveBeenCalled()
}

export async function expectToFind(selector: string) {
  await expectToResolve(page.waitForSelector(selector))
}

export async function expectToNotFind(selector: string) {
  await expectToReject(page.waitForSelector(selector, { timeout: 1000 }))
}

export function sleep(timeout: number) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

export async function scroll({
  totalDistance,
  stepDistance = 100,
}: {
  totalDistance: number
  stepDistance?: number
}) {
  let distance = 0
  while ((distance += stepDistance) < totalDistance) {
    await page.mouse.wheel({ deltaY: stepDistance })
  }
}

export function assert(condition: boolean, err?: Error | string): asserts condition {
  if (!condition) throw typeof err === 'string' ? new Error(err) : err
}

let counter = 0
export async function listenTo(
  event: string,
  target: 'document' | 'window',
  callback: <Args extends unknown[]>(...args: Args) => void,
  oneTime?: boolean,
) {
  const callbackName = 'onEvent' + ++counter
  await page.exposeFunction(callbackName, callback)
  await page.evaluate(
    (event: string, target: 'window' | 'document', callbackName: string, oneTime?: boolean) => {
      const t = target === 'document' ? document : window
      const onEvent = (...args: unknown[]): void => {
        const method = window[callbackName as keyof Window]
        method?.(...args)
        if (oneTime) t.removeEventListener(event, onEvent)
      }
      t.addEventListener(event, onEvent)
    },
    event,
    target,
    callbackName,
    oneTime || false,
  )
}

export function once(event: string, target: 'document' | 'window') {
  return new Promise(resolve => {
    listenTo(
      event,
      target,
      (...args) => {
        resolve(args)
      },
      true,
    )
  })
}

export async function waitForLegacyPJAXRedirect(action?: () => void | Promise<void>) {
  const promise = once('pjax:end', 'document')
  await action?.()
  return promise
}

export async function waitForTurboRedirect(action?: () => void | Promise<void>) {
  const promise = once('turbo:load', 'document')
  await action?.()
  return promise
}

export async function waitForRedirect(action?: () => void | Promise<void>) {
  let fired = false
  const $action =
    action &&
    (() => {
      if (fired) return
      fired = true
      return action()
    })
  return Promise.race([
    waitForLegacyPJAXRedirect($action),
    waitForTurboRedirect($action),
    sleep(3 * 1000),
  ])
}

export async function patientClick(selector: string) {
  await page.waitForSelector(selector)
  await page.click(selector)
}

export async function expandFloatModeSidebar() {
  const rect = await (
    await page.$('.gitako-toggle-show-button')
  )?.evaluate(button => {
    const { x, y, width, height } = button.getBoundingClientRect()
    // pass required properties to avoid serialization issues
    return { x, y, width, height }
  })
  if (rect) {
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2)
    await sleep(500)
  }
}

export async function collapseFloatModeSidebar() {
  await page.mouse.move(600, 600, {
    steps: 100,
  })
  await sleep(500)
}

export function getTextContent(query: string) {
  return page.evaluate(query => document.querySelector(query)?.textContent, query)
}
