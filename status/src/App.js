import React, { Component } from 'react'
//import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import Config from '../truffle.js'
import Web3 from 'web3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0
    }
  }

  componentWillMount() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    // So we can update state later.
    var self = this

    // Get the RPC provider and setup our SimpleStorage contract.
    var {host, port} = Config.networks[process.env.NODE_ENV]
    //console.log('http://' + host + ':' + port);
    const provider = new Web3.providers.HttpProvider('http://' + host + ':' + port)
    const contract = require('truffle-contract')
    //const simpleStorage = contract(SimpleStorageContract)
    //simpleStorage.setProvider(provider)

    // Get Web3 so we can get our accounts.
    const web3RPC = new Web3(provider)

    // Declaring this for later so we can chain functions on SimpleStorage.

    //typeof)web3RPC.banana
    // Get accounts.
    let xhr = web3RPC.banana;
    xhr.addEventListener("load", function(){
      let data = JSON.parse(this.responseText);
      //return self.setState({ storageValue: data[1].id });
    });
    xhr.open('GET', 'http://192.168.178.12:3003/airports', true);
    xhr.send();
    return self.setState({ storageValue:'http://' + host + ':' + port})

  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
            {/*}<ul className="pure-menu-list">
                <li className="pure-menu-item"><a href="#" className="pure-menu-link">News</a></li>
                <li className="pure-menu-item"><a href="#" className="pure-menu-link">Sports</a></li>
                <li className="pure-menu-item"><a href="#" className="pure-menu-link">Finance</a></li>
            </ul>*/}
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>Your Truffle Box is installed and ready.</p>
              <h2>Smart Contract Example</h2>
              <p>The below will show a stored value of 5 by default if your contracts compiled and migrated successfully.</p>
              <p>Try changing the value stored on <strong>line 50</strong> of App.js.</p>
              <p>The stored value is: {this.state.storageValue}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
