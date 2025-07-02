import { render, screen } from '@testing-library/react';
import PostCard from './PostCard';

jest.mock('@/utils/contract', () => ({
  loadContract: jest.fn().mockResolvedValue({ getRetrns: jest.fn().mockResolvedValue([]) }),
}));
jest.mock('@/utils/fetchPost', () => ({
  fetchPost: jest.fn().mockResolvedValue({ hash: 'test', author: '0x0', content: 'Hello world', timestamp: Date.now() }),
}));
jest.mock('@/utils/getPostEarnings', () => ({
  getPostEarnings: jest.fn().mockResolvedValue(0),
}));
jest.mock('@/utils/TrustScoreEngine', () => ({
  getTrustScore: jest.fn().mockResolvedValue(0),
}));
// Mock CreateRetrn to avoid type/runtime errors from its implementation
jest.mock('./CreateRetrn', () => () => <div data-testid="mock-create-retrn" />);

describe('PostCard', () => {
  it('renders without crashing', () => {
    // Provide minimal required props for PostCard
    render(
      <PostCard
        ipfsHash="testhash"
        post={{ hash: 'test', author: '0x0', content: 'Hello world', timestamp: Date.now() }}
      />
    );
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });
}); 