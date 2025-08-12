import '@testing-library/jest-dom'

// Mock Konva for testing
jest.mock('react-konva', () => ({
  Stage: ({ children, ...props }) => <div data-testid="stage" {...props}>{children}</div>,
  Layer: ({ children, ...props }) => <div data-testid="layer" {...props}>{children}</div>,
  Rect: ({ ...props }) => <div data-testid="rect" {...props} />,
  Circle: ({ ...props }) => <div data-testid="circle" {...props} />,
  Text: ({ ...props }) => <div data-testid="text" {...props} />
}))

// Mock Socket.IO
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    close: jest.fn()
  }))
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
