'use strict';

var path = require('path');
var should = require('chai').should();
var sinon = require('sinon');
var proxyquire = require('proxyquire');

describe('#defaultConfig', function() {
  var expectedExecPath = path.resolve(__dirname, '../../bin/okcashd');

  it('will return expected configuration', function() {
    var config = JSON.stringify({
      network: 'livenet',
      port: 3001,
      services: [
        'bitcoind',
        'web'
      ],
      servicesConfig: {
        bitcoind: {
          spawn: {
            datadir: process.env.HOME + '/.okcore/data',
            exec: expectedExecPath
          }
        }
      }
    }, null, 2);
    var defaultConfig = proxyquire('../../lib/scaffold/default-config', {
      fs: {
        existsSync: sinon.stub().returns(false),
        writeFileSync: function(path, data) {
          path.should.equal(process.env.HOME + '/.okcore/okcore-node.json');
          data.should.equal(config);
        },
        readFileSync: function() {
          return config;
        }
      },
      mkdirp: {
        sync: sinon.stub()
      }
    });
    var home = process.env.HOME;
    var info = defaultConfig();
    info.path.should.equal(home + '/.okcore');
    info.config.network.should.equal('livenet');
    info.config.port.should.equal(3001);
    info.config.services.should.deep.equal(['bitcoind', 'web']);
    var bitcoind = info.config.servicesConfig.bitcoind;
    should.exist(bitcoind);
    bitcoind.spawn.datadir.should.equal(home + '/.okcore/data');
    bitcoind.spawn.exec.should.equal(expectedExecPath);
  });
  it('will include additional services', function() {
    var config = JSON.stringify({
      network: 'livenet',
      port: 3001,
      services: [
        'bitcoind',
        'web',
        'insight-ok-api',
        'insight-ok-ui'
      ],
      servicesConfig: {
        bitcoind: {
          spawn: {
            datadir: process.env.HOME + '/.okcore/data',
            exec: expectedExecPath
          }
        }
      }
    }, null, 2);
    var defaultConfig = proxyquire('../../lib/scaffold/default-config', {
      fs: {
        existsSync: sinon.stub().returns(false),
        writeFileSync: function(path, data) {
          path.should.equal(process.env.HOME + '/.okcore/bitcore-node.json');
          data.should.equal(config);
        },
        readFileSync: function() {
          return config;
        }
      },
      mkdirp: {
        sync: sinon.stub()
      }
    });
    var home = process.env.HOME;
    var info = defaultConfig({
      additionalServices: ['insight-ok-api', 'insight-ok-ui']
    });
    info.path.should.equal(home + '/.okcore');
    info.config.network.should.equal('livenet');
    info.config.port.should.equal(3001);
    info.config.services.should.deep.equal([
      'bitcoind',
      'web',
      'insight-ok-api',
      'insight-ok-ui'
    ]);
    var bitcoind = info.config.servicesConfig.bitcoind;
    should.exist(bitcoind);
    bitcoind.spawn.datadir.should.equal(home + '/.okcore/data');
    bitcoind.spawn.exec.should.equal(expectedExecPath);
  });
});
