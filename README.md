# composer-wallet-mongodb

This is Hyperledger Composer Wallet implementation using [MongoDB](https://www.mongodb.com/) as a store.

## Usage

The steps below assume that you have an application or playground, or rest server for Hyperledger Composer that wish to use.
Also it assumes you are familar with NPM, and the card concept in the Composer


### *Step 1*

Firstly, this module that provides the support to connect from Composer to the MongoDB needs to be installed.
This is loaded using a node.js require statment, and the current preview will look for this in the global modules. 

```
npm install -g composer-waller-mongodb
```

### *Step 2*

Configuration needs to be passed to the client appliation using composer to use this new wallet.

There are two main ways this can be achieved. Via configuration file, or via environment variables. 

*File*
Assuming that you do not have the config directory already - this is using the standard node npm `config` module


- Create a directory `config` in the current working directory of the application
- Create a file `default.json` in this `config` directory
- Ensure that the contents of the file are
```
{
  "composer": {
    "wallet": {
      "type": "composer-wallet-mongodb",
      "desc": "Uses a local mongodb instance",
      "options": {
        // Mongodb URI
        "uri": "mongodb://localhost:27017/yourCollection",
        // Collection name for the wallet
        "collectionName": "myWallet",
        // Mongoose connection options
        "options": {

        }
      }
    }
  }
}
```

- `type` is the name of this module
- `desc` is some text for the humans
- `options` options for MongoDB connection


*Environment Variable*

As this is using the *config* module specifing the details on the command line via environment variables can be achieved by

```
export NODE_CONFIG='{
  "composer": {
    "wallet": {
      "type": "composer-wallet-mongodb",
      "desc": "Uses a local mongodb instance",
      "options": {
        "uri": "mongodb://localhost:27017/yourCollection",
        "collectionName": "myWallet",
        "options": {

        },
	"encrypted": true,
	"encryption": {
		"algorithm": "aes256",
		"key": "somesecret"
	}
      }
    }
  }
}'
```

The any application (or command line, eg `composer card list`) that is in this shell will use the MongoDB wallets. 
