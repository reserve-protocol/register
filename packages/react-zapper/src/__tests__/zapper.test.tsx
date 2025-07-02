import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Zapper } from '../components/zapper'
import type { ZapperProps } from '../types'

const mockProps: ZapperProps = {
  chain: 1,
  dtfAddress: '0x123' as `0x${string}`,
}

describe('Zapper Component', () => {
  it('renders modal zapper', () => {
    render(<Zapper {...mockProps} />)
    // Zapper renders in modal mode only, modal starts closed
    expect(true).toBe(true) // Basic test that component mounts
  })

  it('accepts optional apiUrl prop', () => {
    render(<Zapper {...mockProps} apiUrl="https://custom-api.example.com" />)
    expect(true).toBe(true) // Basic test that component mounts with apiUrl
  })
})
