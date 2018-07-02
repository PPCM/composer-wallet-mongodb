/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

const Wallet = require('composer-common').Wallet
const mongoose = require('mongoose')
const Promise = require('bluebird')

/**
 * Main class for Hyperledger Composer Wallet implementation using MongoDB as a store
 */
module.exports = class MongoDBWallet extends Wallet {

  /**
   * Consstruction of the class
   * @param {*} options Options for this implementations
   */
  constructor(options) {
    super()
    if (!options) {
      throw new Error('Need configuration')
    }
    if (!options.uri) {
      throw new Error('Need an URI to connect to MongoDB')
    }
    if (!options.collectionName) {
      throw new Error('Need a collection name for the wallet')
    }
    if (!options.namePrefix) {
      throw new Error('Need a namePrefix in options')
    }

    this.mongodbConfig = options
    this.namePrefix = options.namePrefix

    // Connect to MongoDB
    this.connection = mongoose.createConnection(this.mongodbConfig.uri, this.mongodbConfig.options)

    // Create the model according the schema needed by the wallet
    this.wallet = this.connection.model(this.mongodbConfig.collectionName, {
      name: {
        type: String,
        required: true
      },
      path: {
        type: String,
        required: true
      },
      valueBase64: {
        type: String
      },
      valueString: {
        type: String
      }
    })
  }

  /**
   * Add a new credential to the wallet.
   *
   * @param {string} name The name of the credentials.
   * @param {string} value The credentials.
   * @return {Promise} A promise that is resolved when
   * complete, or rejected with an error.
   */
  async put(name, value) {
    if (!name) {
      return Promise.reject(new Error('Name must be specified'))
    }

    const card = {
      name: name,
      path: this.namePrefix
    }
    if (value instanceof Buffer) {
      // base 64 encode the buffer and write it as a string.
      card.valueBase64 = value.toString('base64')
    } else if (value instanceof String || typeof value === 'string') {
      card.valueString = value
    } else {
      return Promise.reject(new Error('Unkown type being stored'))
    }

    return await this.wallet.update(
      {
        name: card.name,
        path: this.namePrefix
      },
      card,
      { upsert: true, overwrite: true })
  }

  /**
   * Remove existing credentials from the wallet.
   * @param {string} name The name of the credentials.
   * @return {Promise} A promise that is resolved when
   * complete, or rejected with an error.
   */
  async remove(name) {
    if (!name) {
      return Promise.reject(new Error('Name must be specified'))
    }
    return await this.wallet.remove(
      {
        name: name,
        path: this.namePrefix
      }).exec()
  }

  /**
   * List all of the credentials in the wallet.
   * @return {Promise} A promise that is resolved with
   * an array of credential names, or rejected with an
   * error.
   */
  async listNames() {
    let result = await this.wallet.find(
      {
        path: this.namePrefix
      },
      {
        '_id': false,
        'name': true
      }).exec()
    result = result.map( (elt) => {
      return elt.name
    } )
    return result
  }

  /**
   * Check to see if the named credentials are in
   * the wallet.
   *
   * @param {string} name The name of the credentials.
   * @return {Promise} A promise that is resolved with
   * a boolean; true if the named credentials are in the
   * wallet, false otherwise.
   */
  async contains(name) {
    if (!name) {
      return Promise.reject(new Error('Name must be specified'))
    }

    let result = await this.wallet.findOne(
      {
        name: name,
        path: this.namePrefix
      }).exec()
    return (result !== null)
  }

  /**
   * Get the named credentials from the wallet.
   * @param {string} name The name of the credentials.
   * @return {Promise} A promise that is resolved with
   * the named credentials, or rejected with an error.
   */
  async get(name) {
    if (!name) {
      return Promise.reject(new Error('Name must be specified'))
    }

    let card = await this.wallet.findOne(
      {
        name: name,
        path: this.namePrefix
      }).exec()
    if (!card) {
      throw new Error('The specified key does not exist')
    }

    card = card.toObject()  // Convert MongoDB Document to JS Object
    let data = null
    if (card.hasOwnProperty('valueBase64')) {
      data = Buffer.from(card.valueBase64, 'base64')
    }
    else if (card.hasOwnProperty('valueString')) {
      data = card.valueString
    }
    else {
      throw new Error('Unkown type being stored')
    }

    return data
  }

  /**
   * Gets all the objects under this prefix and tag
   * An empty storage service will return a map with no contents
   *
   * @return {Promise} A Promise that is resolved with a map of the names and the values
   */
  async getAll() {
    let results = new Map()

    let keys = await this.listNames()

    // use the keys to get the data, the get handles the types as needed
    for (const key of keys) {
      const value = await this.get(key)
      results.set(key, value)
    }

    return results
  }
}