import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useWeb3AuthConnect, useWeb3AuthDisconnect } from '@web3auth/modal/react';
import { useAccount } from 'wagmi';
import App from '../App';

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('App Rendering', () => {
    beforeEach(() => {
      vi.mocked(useWeb3AuthConnect).mockReturnValue({
        connect: vi.fn(),
        isConnected: false,
        connectorName: 'Web3Auth',
        loading: false,
        error: null,
      });
      vi.mocked(useAccount).mockReturnValue({
        address: undefined,
      } as any);
      vi.mocked(useWeb3AuthDisconnect).mockReturnValue({
        disconnect: vi.fn(),
        loading: false,
        error: null,
      });
    });

    it('renders app with layout structure', () => {
      render(<App />);

      // App should render with Layout, Header, and Footer components
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders Home page content on initial load', () => {
      render(<App />);

      // Home page renders AudioRecorder by default, which includes mock mode button
      expect(screen.getByText(/Load Mock Track Data/)).toBeInTheDocument();
    });

    it('renders toast provider for notifications', () => {
      render(<App />);

      // Toast notifications container should be present
      const toastRegion = screen.getByRole('region', { name: /toast notifications/i });
      expect(toastRegion).toBeInTheDocument();
    });

    it('renders main content area', () => {
      render(<App />);

      // Main content should be present
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveClass('main-content');
    });
  });

  describe('Home Page Integration', () => {
    beforeEach(() => {
      vi.mocked(useWeb3AuthConnect).mockReturnValue({
        connect: vi.fn(),
        isConnected: false,
        connectorName: 'Web3Auth',
        loading: false,
        error: null,
      });
      vi.mocked(useAccount).mockReturnValue({
        address: undefined,
      } as any);
      vi.mocked(useWeb3AuthDisconnect).mockReturnValue({
        disconnect: vi.fn(),
        loading: false,
        error: null,
      });
    });

    it('displays AudioRecorder component when no discovery data', () => {
      render(<App />);

      // AudioRecorder should be visible with mock data button
      expect(screen.getByText(/Load Mock Track Data/)).toBeInTheDocument();
      expect(screen.getByText(/To disable mock mode:/)).toBeInTheDocument();
    });

    it('renders with mocked Layout components', () => {
      render(<App />);

      // All layout components should be mocked and present
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Router Structure', () => {
    beforeEach(() => {
      vi.mocked(useWeb3AuthConnect).mockReturnValue({
        connect: vi.fn(),
        isConnected: false,
        connectorName: 'Web3Auth',
        loading: false,
        error: null,
      });
      vi.mocked(useAccount).mockReturnValue({
        address: undefined,
      } as any);
      vi.mocked(useWeb3AuthDisconnect).mockReturnValue({
        disconnect: vi.fn(),
        loading: false,
        error: null,
      });
    });

    it('renders App with BrowserRouter and Routes', () => {
      render(<App />);

      // Check that the app renders without errors
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders ToastProvider wrapper', () => {
      render(<App />);

      // Toast provider should wrap the app
      const toastContainer = screen.getByRole('region', { name: /toast notifications/i });
      expect(toastContainer).toBeInTheDocument();
    });

    it('renders Toaster component for displaying toasts', () => {
      render(<App />);

      // Toaster should be present for displaying toast messages
      const toastRegion = screen.getByRole('region', { name: /toast notifications/i });
      expect(toastRegion).toBeInTheDocument();
    });
  });

  describe('Web3Auth Integration', () => {
    it('renders with Web3Auth context when not connected', () => {
      vi.mocked(useWeb3AuthConnect).mockReturnValue({
        connect: vi.fn(),
        isConnected: false,
        connectorName: 'Web3Auth',
        loading: false,
        error: null,
      });
      vi.mocked(useAccount).mockReturnValue({
        address: undefined,
      } as any);
      vi.mocked(useWeb3AuthDisconnect).mockReturnValue({
        disconnect: vi.fn(),
        loading: false,
        error: null,
      });

      render(<App />);

      // App should render successfully with Web3Auth context
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders with Web3Auth context when connected', () => {
      const mockAddress = '0x1234567890123456789012345678901234567890';

      vi.mocked(useWeb3AuthConnect).mockReturnValue({
        connect: vi.fn(),
        isConnected: true,
        connectorName: 'Web3Auth',
        loading: false,
        error: null,
      });
      vi.mocked(useAccount).mockReturnValue({
        address: mockAddress as any,
      } as any);
      vi.mocked(useWeb3AuthDisconnect).mockReturnValue({
        disconnect: vi.fn(),
        loading: false,
        error: null,
      });

      render(<App />);

      // App should render successfully when connected
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });
  });
});
