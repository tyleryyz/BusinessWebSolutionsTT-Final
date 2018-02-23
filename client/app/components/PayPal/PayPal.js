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
            sandbox: 'AUF9q58jUbZ79R8AFyy4EFE4W07SGJqLo7Xqsngr4Birx1Fz8WfgjLWpwr3C-CeelMaL7LbCDMHxxg6v',
            production: 'AWre8N0N2d_uCfSCFf4mSuYENw2uitbgzU2T9mZG7DCyIdzPDRB_pMlI0TK4-QribrKDvrXc0lTIjpkr'
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
            return actions.payment.execute().then(console.log("Payment success!"));
        };

        let PayPalButton = paypal.Button.driver('react', { React, ReactDOM });



        return (<div className='shoppingCart'>
            <p>Buy <strong>Full Body Lobster Onesie - $0.01</strong> now!</p>

            <PayPalButton
                client={client}
                payment={payment}
                commit={true}
                onAuthorize={onAuthorize} />
        </div>);
    }
};


export default PayPal;
