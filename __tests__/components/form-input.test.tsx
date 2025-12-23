import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormInput } from '@/components/ui/form-input';

describe('FormInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render input with label', () => {
    render(
      <FormInput
        label="Username"
        type="text"
        placeholder="Enter username"
      />
    );

    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
  });

  it('should display error message when provided', () => {
    render(
      <FormInput
        label="Email"
        type="email"
        error="Invalid email format"
      />
    );

    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  it('should display helper text when provided', () => {
    render(
      <FormInput
        label="Password"
        type="password"
        helperText="At least 8 characters"
      />
    );

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });

  it('should mark required fields with asterisk', () => {
    render(
      <FormInput
        label="Username"
        type="text"
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should disable input when disabled prop is true', () => {
    render(
      <FormInput
        label="Username"
        type="text"
        disabled
      />
    );

    const input = screen.getByDisplayValue('');
    expect(input).toBeDisabled();
  });

  it('should call onChange handler on input change', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <FormInput
        label="Username"
        type="text"
        onChange={handleChange}
      />
    );

    const input = screen.getByDisplayValue('');
    await user.type(input, 'testuser');

    expect(handleChange).toHaveBeenCalled();
  });

  it('should have aria-invalid attribute when error is present', () => {
    render(
      <FormInput
        label="Email"
        type="email"
        error="Invalid email"
      />
    );

    const input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
