/* 	This file is the main page, so http://localhost:8080
	Changes made here will be loaded automatically on file save */

import React, { Component } from 'react';

/*  These imports are links from the specified folders. 
	These will pull data from the JS files so they can be
	used as those tags within the App constructor. */
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import NavBar from '../Login/NavBar';

/* IGNORE THIS BLOCK OF CODE
var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors());

app.get('/products/:id', function (req, res, next) {
  res.json({msg: 'This is CORS-enabled for all origins!'})
});

app.listen(80, function () {
  console.log('CORS-enabled web server listening on port 80')
});
*/

/*  This is the template where the main page will be built from.
	Currently, NavBar appears on EVERY PAGE, where {children}
	can be any page that is currently being loaded. */
const App = ({ children }) => (
  <div>
    <NavBar />

    <main>
      {children}
    </main>

    <Footer />
  </div>
);

export default App;
