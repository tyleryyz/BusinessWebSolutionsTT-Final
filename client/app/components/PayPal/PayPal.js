import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

var firebase = require('firebase');
var paypal = require('paypal-checkout');

// Will create a PayPal CHeckout button for 0.01 to Tailored Tutoring Co. LLC
// Everything works, one issue though is that we may want to include a description
// As the Paypal receipt gives no information as to Why or what the transaction was for.
class PayPal extends React.Component{

  constructor(props) {
    super(props);

    this.setPurchased = this.setPurchased.bind(this);
  }

  setPurchased(imageURL) {
    let isPurchased=0;
    if(isPurchased==0){
      fetch(`/api/images?imageURL=${imageURL}`, {
          method: 'PUT',
          headers: {
          "Content-Type": "Application/json"
          },
          body: JSON.stringify({purchased: 1})
        })
      console.log("Video Purchased!");
    } else {
      fetch(`/api/images?imageURL=${imageURL}`, {
          method: 'PUT',
          headers: {
          "Content-Type": "Application/json"
          },
          body: JSON.stringify({purchased: 0})
        })
      console.log("Video Un-purchased!");
    }
  }

    render(){

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
                            amount: { total: 0.01, currency: 'USD' }
                        }
                    ]
                }
            })
        };

        let onAuthorize = (data, actions) => {
			// return [Some kind of function that gives authorization to a video]
            return actions.payment.execute().then(this.setPurchased(this.props.image));
        };

        let PayPalButton = paypal.Button.driver('react', { React, ReactDOM });

        return (<div className='shoppingCart'>
            <PayPalButton
                client={client}
                payment={payment}
                commit={true}
				        env='sandbox'
                onAuthorize={onAuthorize} />
        </div>);
    }
};


export default PayPal;
