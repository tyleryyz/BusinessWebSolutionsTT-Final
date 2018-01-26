/*  This is the "Page not Found" page.
	If the user enters a non-existant, or non-imported page,
	they will be sent here. */

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div>
    <h2>Page not found</h2>

    <Link to="/">Go home</Link>
  </div>
);

export default NotFound;
