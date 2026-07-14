import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Node 22+ ships an experimental `localStorage` global that is undefined
// without --localstorage-file and shadows jsdom's implementation in vitest.
// Install an in-memory Storage so app code and tests can use it normally.
class MemoryStorage implements Storage {
  #data = new Map<string, string>()
  get length() {
    return this.#data.size
  }
  clear() {
    this.#data.clear()
  }
  getItem(key: string) {
    return this.#data.get(key) ?? null
  }
  key(index: number) {
    return [...this.#data.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.#data.delete(key)
  }
  setItem(key: string, value: string) {
    this.#data.set(key, String(value))
  }
}

const hasUsableStorage = (() => {
  try {
    return typeof globalThis.localStorage?.getItem === 'function'
  } catch {
    return false
  }
})()

if (!hasUsableStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    writable: true,
    configurable: true,
  })
}

afterEach(() => {
  cleanup()
})
