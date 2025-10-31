/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../src/App';

// Note: import explicitly to use the typescript type definitions
import {render} from '@testing-library/react-native';

it('renders correctly', () => {
  render(<App />);
});