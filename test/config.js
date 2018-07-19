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

const getStore = require('../index.js').getStore

const wrongConfigs = [{
  c: null,
  text: 'Need configuration',
},
{
  c: {},
  text: 'Need an URI to connect to MongoDB'
},
{
  c: { uri: 'mongodb://localhost:27017/testWallletCollection' },
  text: 'Need a collection name for the wallet'
},
{
  c: {
    uri: 'mongodb://localhost:27017/testWallletCollection',
    collectionName: 'testWallet'
  },
  text: 'Need a namePrefix in options'
}
]

const correctConfigs = [{
  uri: 'mongodb://localhost:27017/testWallletCollection',
  collectionName: 'testWallet',
  'namePrefix':'test',
  encrypted: true,
  encryption : {
    algorithm: 'aes256',
    key: 'somekey'
  }
}]

/**
 * Clean the collection
 * @param {Object} config Config to clean
 */
async function clean(config) {
  const mongoose = require('mongoose')

  const connection = mongoose.createConnection(config.uri, config.options)
  await connection.dropDatabase()
}

module.exports = {
  getStore: getStore,
  wrongConfigs: wrongConfigs,
  correctConfigs: correctConfigs,
  clean: clean
}