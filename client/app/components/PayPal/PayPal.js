import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

var firebase = require('firebase');
var paypal = require('paypal-checkout');

// Will create a PayPal CHeckout button for 0.01 to Tailored Tutoring Co. LLC
// Everything works, one issue though is that we may want to include a description
// As the Paypal receipt gives no information as to Why or what the transaction was for.
class PayPal extends React.Component{
  
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
            return actions.payment.execute().then(console.log("Payment Success!"));
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
