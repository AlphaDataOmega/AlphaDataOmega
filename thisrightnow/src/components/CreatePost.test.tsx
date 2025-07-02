import { render, screen } from '@testing-library/react';
import CreatePost from './CreatePost';
import { vi } from 'vitest';

describe('CreatePost', () => {
  it('renders a Post button', () => {
    render(<CreatePost onPosted={vi.fn()} />);
    expect(screen.getByRole('button', { name: /post/i })).toBeInTheDocument();
  });
}); 