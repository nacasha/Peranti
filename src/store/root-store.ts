import { mapValuesKey } from '@udecode/zustood';

import inputStore from './input-store';
import outputStore from './output-store';
import toolStore from './tool-store';

// Global store
export const rootStore = {
  input: inputStore,
  output: outputStore,
  tool: toolStore,
};

// Global hook selectors
export const useStore = () => mapValuesKey('use', rootStore);

// Global getter selectors
export const store = mapValuesKey('get', rootStore);

// Global actions
export const actions = mapValuesKey('set', rootStore);
