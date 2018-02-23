import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'whatwg-fetch';

var firebase = require('firebase');
var paypal = require('paypal-checkout');

var MyCartComponent = React.createClass({
    render: function() {

        let client = {
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
            return actions.payment.execute().then(console.log("Payment success!"));
        };

        let PayPalButton = paypal.Button.driver('react', { React, ReactDOM });



        return (<div className='shoppingCart'>
            <p>Buy <strong>Full Body Lobster Onesie - $24.99</strong> now!</p>

            <PayPalButton
                client={client}
                payment={payment}
                commit={true}
                onAuthorize={onAuthorize} />
        </div>);
    }
});

// Will render a profile image, user name, user class list, user school,
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      loaded: false
    };
    this.getData = this.getData.bind(this)
  }

  getData() {
    let uID = this.props.user.uid;
    console.log(uID)
    return (fetch(`/api/users?uID=${uID}`, {
      headers: {
        "Content-Type": "Application/json"
      },
      method: 'GET'
    }).then(res => res.json()));
  }

  componentWillMount() {
    let result = this.getData().then((user) => {
      console.log("will mount here", user)
      this.setState({
        user: user,
        loaded: false
      }, () => {
        this.setState({loaded: true})
      });
    })
  };

  render() {
    if (this.state.user) {
      return (<div>
        {console.log("here!", this.state.user)}
        {this.state.user.fname}
        <p>{this.state.user.school}</p>
        {this.state.user.classList.map((subject, index) => (
          <p key={index}>{subject}</p>
        ))}
        <MyCartComponent />
      </div>);
    } else {
      return (<div>
        <h1>Please wait</h1>
      </div>)
    }

  }
}

export default Home;
