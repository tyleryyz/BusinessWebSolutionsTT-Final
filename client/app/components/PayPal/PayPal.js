import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

var firebase = require('firebase');
var paypal = require('paypal-checkout');


class PayPal extends React.Component {

  constructor(props) {
    super(props);

    this.setPurchased = this.setPurchased.bind(this);
  }

  setPurchased(imageURL) {
    let isPurchased = 0;
    if (isPurchased == 0) {
      fetch(`/api/images?imageURL=${imageURL}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({purchased: 1})
      })
    } else {
      fetch(`/api/images?imageURL=${imageURL}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify({purchased: 0})
      })
    }
  }

  render() {

    let client = {
      // DELETE THESE BEFORE PUSHING IF MAKING ANY CHANGES TO THIS FILE
		sandbox: '',
		production: ''
    };

    let payment = (data, actions) => {
      return actions.payment.create({
        payment: {
          transactions: [
            {
              amount: {
                total: this.props.cost,
                currency: 'USD'
              }
            }
          ]
        }
      })
    };

    let onAuthorize = (data, actions) => {
      // return [Some kind of function that gives authorization to a video]
      return actions.payment.execute().then(this.setPurchased(this.props.image));
    };

    let PayPalButton = paypal.Button.driver('react', {React, ReactDOM});

    return (<div className='shoppingCart'>
      <PayPalButton
		client={client}
		commit={true}
		env='sandbox'
		onAuthorize={onAuthorize}
		payment={payment}/>
    </div>);
  }
};

export default PayPal;
