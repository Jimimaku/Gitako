import { CheckboxProps, FormControl, Checkbox as PrimerCheckbox } from '@primer/react'
import React from 'react'

export function Checkbox({
  label,
  value,
  onChange,
  checked = value,
  ...rest
}: Override<CheckboxProps, { label: React.ReactNode } & IO<boolean>>) {
  return (
    <FormControl disabled={rest.disabled}>
      <PrimerCheckbox
        sx={{
          marginTop: '4px', // align label
        }}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        {...rest}
      />
      <FormControl.Label>{label}</FormControl.Label>
    </FormControl>
  )
}
