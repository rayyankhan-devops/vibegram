import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../src/pages/LoginPage';
import { RegisterPage } from '../src/pages/RegisterPage';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { authApi } from '../src/api/auth';

vi.mock('../src/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe('Authentication Pages', () => {
  it('renders LoginPage with inputs, buttons, and demo account presets', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <LoginPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /VibeGram/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username or Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/@alex_design/i)).toBeInTheDocument();
  });

  it('clicking demo preset fills username and password on login page', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <LoginPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    const demoBtn = screen.getByText(/@alex_design/i);
    fireEvent.click(demoBtn);

    const usernameInput = screen.getByLabelText(/Username or Email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

    expect(usernameInput.value).toBe('alex_design');
    expect(passwordInput.value).toBe('password123');
  });

  it('renders RegisterPage with registration fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <RegisterPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Join VibeGram/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('calls authApi.login on form submission', async () => {
    const mockAuthResponse = {
      access_token: 'fake_jwt_token_123',
      token_type: 'bearer',
      user: {
        _id: '123',
        username: 'alex_design',
        email: 'alex@vibegram.app',
        display_name: 'Alex Rivera',
        bio: '',
        avatar_url: '',
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        created_at: new Date().toISOString(),
      },
    };
    vi.mocked(authApi.login).mockResolvedValue(mockAuthResponse);

    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <LoginPage />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username or Email/i), {
      target: { value: 'alex_design' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        username_or_email: 'alex_design',
        password: 'password123',
      });
    });
  });
});
