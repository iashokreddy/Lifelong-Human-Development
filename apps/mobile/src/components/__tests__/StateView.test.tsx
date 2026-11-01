import { fireEvent, render } from '@testing-library/react-native';
import { StateView } from '../StateView';

describe('StateView', () => {
  it('renders the error message when error is set', () => {
    const { getByText } = render(
      <StateView error="network down" />,
    );
    expect(getByText('We could not reach the server')).toBeTruthy();
    expect(getByText('network down')).toBeTruthy();
  });

  it('renders the empty copy when empty is true', () => {
    const { getByText } = render(
      <StateView empty emptyMessage="No phases yet." />,
    );
    expect(getByText('No phases yet.')).toBeTruthy();
  });

  it('renders a loading indicator when loading is true', () => {
    const { getByText } = render(<StateView loading />);
    expect(getByText('Loading…')).toBeTruthy();
  });

  it('calls onRetry when the retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByLabelText } = render(
      <StateView error="boom" onRetry={onRetry} />,
    );
    fireEvent.press(getByLabelText('Try again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('returns nothing when there is no state to report', () => {
    const { toJSON } = render(<StateView />);
    expect(toJSON()).toBeNull();
  });
});
