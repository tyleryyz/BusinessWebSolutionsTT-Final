// import React, {Component} from 'react';
// import 'whatwg-fetch';
//
// var firebase = require('firebase');
//
// // Will render a profile image, user name, user class list, user school,
// class Payment extends Component {
//   constructor(props) {
//     super(props);
//   }
//
//   componentDidMount () {
//         var style = {
//           base: {
//             // Add your base input styles here. For example:
//             fontSize: '16px',
//             color: "#32325d",
//           }
//         };
//
//         // Create an instance of the card Element.
//         var card = elements.create('card', {style: style});
//
//         // Add an instance of the card Element into the `card-element` <div>.
//         card.mount('#card-element');
//     }
//
//   render() {
//       return (
//           <form action="/charge" method="post" id="payment-form">
//               <div class="form-row">
//                 <label for="card-element">
//                   Credit or debit card
//                 </label>
//                 <div id="card-element">
//
//                 </div>
//
//
//                 <div id="card-errors" role="alert"></div>
//               </div>
//
//               <button>Submit Payment</button>
//             </form>
//       );
//   }
// }
//
// export default Payment;

var React = require('react');
var ReactScriptLoaderMixin = require('react-script-loader').ReactScriptLoaderMixin;

var PaymentForm = React.createClass({
  mixins: [ ReactScriptLoaderMixin ],

  getInitialState: function() {
    return {
      stripeLoading: true,
      stripeLoadingError: false,
      submitDisabled: false,
      paymentError: null,
      paymentComplete: false,
      token: null
    };
  },

  getScriptURL: function() {
    return 'https://js.stripe.com/v2/';
  },

  onScriptLoaded: function() {
    if (!PaymentForm.getStripeToken) {
      // Put your publishable key here
      Stripe.setPublishableKey('pk_test_15FJTbVvcwpdTavwqoCcIMTp');

      this.setState({ stripeLoading: false, stripeLoadingError: false });
    }
  },

  onScriptError: function() {
    this.setState({ stripeLoading: false, stripeLoadingError: true });
  },

  onSubmit: function(event) {
    var self = this;
    event.preventDefault();
    this.setState({ submitDisabled: true, paymentError: null });
    // send form here
    Stripe.createToken(event.target, function(status, response) {
      if (response.error) {
        self.setState({ paymentError: response.error.message, submitDisabled: false });
      }
      else {
        self.setState({ paymentComplete: true, submitDisabled: false, token: response.id });
        // make request to your server here!
      }
    });
  },

  render: function() {
    if (this.state.stripeLoading) {
      return <div>Loading</div>;
    }
    else if (this.state.stripeLoadingError) {
      return <div>Error</div>;
    }
    else if (this.state.paymentComplete) {
      return <div>Payment Complete!</div>;
    }
    else {
      return (<form onSubmit={this.onSubmit} >
        <span>{ this.state.paymentError }</span><br />
        <input type='text' data-stripe='number' placeholder='credit card number' /><br />
        <input type='text' data-stripe='exp-month' placeholder='expiration month' /><br />
        <input type='text' data-stripe='exp-year' placeholder='expiration year' /><br />
        <input type='text' data-stripe='cvc' placeholder='cvc' /><br />
        <input disabled={this.state.submitDisabled} type='submit' value='Purchase' />
      </form>);
    }
  }
});

module.exports = PaymentForm;
