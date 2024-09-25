import { render } from '@testing-library/react'
import React, { ComponentProps } from 'react'
import { Highlight } from './Highlight'

function test(
  title: string,
  text: string,
  match: ComponentProps<typeof Highlight>['match'],
  expected = text,
) {
  it(title, () => {
    expect(render(<Highlight text={text} match={match} />).container.textContent).toBe(expected)
  })
}

test('abc', 'abc', undefined)
test('abc1', 'abc', /./)
test('abc2', 'abc', /../)
test('abc3', 'abc', /.../)
test('abc4', 'abc', /..../)
test('abcd', 'abcd', /^((?!ab)cd)*$/, 'abcd')
