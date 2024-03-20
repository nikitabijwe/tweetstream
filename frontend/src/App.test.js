import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import io from 'socket.io-client';
import { act } from 'react-dom/test-utils';

// Mock the socket.io-client module
jest.mock('socket.io-client', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      on: jest.fn(),
      emit: jest.fn(),
    })),
  };
});

// Mock the fetch function to return a predefined set of users
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]),
  })
);

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  it('renders the App component and fetches users', async () => {
    act(() => {
      render(<App />);
    });

    // Check that the fetch function was called
    expect(fetch).toHaveBeenCalled();

    // Wait for the users to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument();
      expect(screen.getByText('User 2')).toBeInTheDocument();
    });
  });

  it('initializes the socket connection', () => {
    act(() => {
      render(<App />);
    });

    // Check that the socket.io-client was initialized
    expect(io).toHaveBeenCalledWith('http://localhost:1300');
  });
});




