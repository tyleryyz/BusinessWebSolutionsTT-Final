import React, {Component} from 'react';
import 'whatwg-fetch';

var firebase = require('firebase');

// Will render a profile image, user name, user class list, user school,
class Payment extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount () {
        var style = {
          base: {
            // Add your base input styles here. For example:
            fontSize: '16px',
            color: "#32325d",
          }
        };

        // Create an instance of the card Element.
        var card = elements.create('card', {style: style});

        // Add an instance of the card Element into the `card-element` <div>.
        card.mount('#card-element');
    }

  render() {
      return (
          <form action="/charge" method="post" id="payment-form">
              <div class="form-row">
                <label for="card-element">
                  Credit or debit card
                </label>
                <div id="card-element">

                </div>


                <div id="card-errors" role="alert"></div>
              </div>

              <button>Submit Payment</button>
            </form>
      );
  }
}

export default Payment;
