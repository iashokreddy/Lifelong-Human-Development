// Smoke test: proves jest-expo boots through the workspace path that ends in a
// literal '%' (which breaks Vitest's decodeURI).
describe('jest-expo runner', () => {
  it('boots and runs a trivial assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
