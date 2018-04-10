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
		console.log("response: ", response);
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
      return (
	  <div className="box">
		<form onSubmit={this.onSubmit}>
		<span>{ this.state.paymentError }</span><br />
		  <div className="field">
			<div className="control">
			  <input className="input" data-stripe="number" type="text" placeholder="Card Number"/>
			</div>
		  </div>

		  <div className="field">
			<div className="control">
			  <input className="input" data-stripe="exp-month" type="text" placeholder="Expiration Month"/>
			</div>
		  </div>

		  <div className="field">
			<div className="control">
			  <input className="input" data-stripe="exp-year" type="text" placeholder="Expiration Year"/>
			</div>
		  </div>

		  <div className="field">
			<div className="control">
			  <input className="input" data-stripe="cvc" type="text" placeholder="CVC"/>
			</div>
		  </div>

		  <div className="control">
			<button className="button">Purchase</button>
		  </div>
		</form>
	  </div>);
    }
  }
});

module.exports = PaymentForm;
