import React, {Component} from 'react';
import {render} from 'react-dom';

const details = {}
const methodData = []
const options = {}

const getOptionsforAddress = shippingAddress => {return;}
const updateTotal = shippingOption => {return;}

class Payment extends Component{
    render(){

        <ReactPaymentRequest
          details={details}
          methodData={methodData}
          onError={error => console.log('💩', error)}
          onShippingAddressChange={(request, resolve, reject) => {
            details.shippingOptions = getOptionsforAddress(request.shippingAddress)
            resolve(details)
          }}
          onShippingOptionChange={(request, resolve, reject) => {
            details.shippingOptions = updateTotal(request.shippingOption)
            resolve(details)
          }}
          onSuccess={result => result.complete('success')}
          options={options}
        >
          <button>Pay</button>
        </ReactPaymentRequest>
    }
}
