// Mock para variables de entorno globales
global.import = {
   meta: {
      env: {
         VITE_API_URL: 'http://localhost:5000',
         MODE: 'test',
      },
   },
};

// Mock para localStorage
const localStorageMock = {
   getItem: jest.fn(),
   setItem: jest.fn(),
   removeItem: jest.fn(),
   clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock para sessionStorage
const sessionStorageMock = {
   getItem: jest.fn(),
   setItem: jest.fn(),
   removeItem: jest.fn(),
   clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
   writable: true,
   value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
   })),
});

// Resetear todos los mocks antes de cada test
beforeEach(() => {
   jest.clearAllMocks();
   localStorageMock.getItem.mockClear();
   localStorageMock.setItem.mockClear();
   localStorageMock.removeItem.mockClear();
   localStorageMock.clear.mockClear();
   sessionStorageMock.getItem.mockClear();
   sessionStorageMock.setItem.mockClear();
   sessionStorageMock.removeItem.mockClear();
   sessionStorageMock.clear.mockClear();
});
