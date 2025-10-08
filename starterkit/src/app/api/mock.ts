// Mock adapter completely disabled - using real API calls only
// No mock adapter will be created

// Export a dummy mock object to prevent import errors
const mock = {
  onGet: () => ({ reply: () => {} }),
  onPost: () => ({ reply: () => {} }),
  onPut: () => ({ reply: () => {} }),
  onDelete: () => ({ reply: () => {} }),
  onAny: () => ({ passThrough: () => {} }),
  onPatch: () => ({ reply: () => {} }),
  reset: () => {},
  restore: () => {},
};
export default mock;
