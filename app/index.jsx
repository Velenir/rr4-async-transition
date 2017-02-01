import React from 'react';
import {render} from 'react-dom';

import './main.scss';

import Example from './components/Example';

render(
	<Example />,
	document.getElementById("app")
);
