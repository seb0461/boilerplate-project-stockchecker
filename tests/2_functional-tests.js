const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    this.timeout(5000); // Increased timeout for network requests

    let initialLikesAAPL = 0;
    let initialLikesGOOG = 0;
    let initialLikesIBM = 0;
    let initialLikesTSLA = 0;
    let initialLikesMSFT = 0;


    suite('GET /api/stock-prices => stockData object', function() {

        test('Viewing one stock', function(done) {
            chai.request(server)
                .get('/api/stock-prices/?stock=AAPL')
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body.stockData);
                    assert.equal(res.body.stockData.stock, 'AAPL');
                    assert.isString(res.body.stockData.price);
                    assert.isNumber(res.body.stockData.likes);
                    initialLikesAAPL = res.body.stockData.likes;
                    done();
                });
        });

        test('Viewing one stock and liking it', function(done) {
            chai.request(server)
                .get('/api/stock-prices/?stock=GOOG&like=true')
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body.stockData);
                    assert.equal(res.body.stockData.stock, 'GOOG');
                    assert.isString(res.body.stockData.price);
                    assert.equal(res.body.stockData.likes, initialLikesGOOG + 1);
                    initialLikesGOOG = res.body.stockData.likes;
                    done();
                });
        });

        test('Viewing the same stock and liking it again', function(done) {
            chai.request(server)
                .get('/api/stock-prices/?stock=GOOG&like=true')
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body.stockData);
                    assert.equal(res.body.stockData.stock, 'GOOG');
                    assert.isString(res.body.stockData.price);
                    assert.equal(res.body.stockData.likes, initialLikesGOOG);
                    done();
                });
        });

        test('Viewing two stocks', function(done) {
            chai.request(server)
                .get('/api/stock-prices/?stock=IBM&stock=MSFT')
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body.stockData);
                    assert.lengthOf(res.body.stockData, 2);

                    const ibmStock = res.body.stockData.find(s => s.stock === 'IBM');
                    const msftStock = res.body.stockData.find(s => s.stock === 'MSFT');

                    assert.equal(ibmStock.stock, 'IBM');
                    assert.isString(ibmStock.price);
                    assert.isNumber(ibmStock.likes);
                    initialLikesIBM = ibmStock.likes;

                    assert.equal(msftStock.stock, 'MSFT');
                    assert.isString(msftStock.price);
                    assert.isNumber(msftStock.likes);
                    initialLikesMSFT = msftStock.likes;

                    done();
                });
        });

        test('Viewing two stocks and liking them', function(done) {
            chai.request(server)
                .get('/api/stock-prices/?stock=IBM&stock=TSLA&like=true')
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body.stockData);
                    assert.lengthOf(res.body.stockData, 2);

                    const ibmStock = res.body.stockData.find(s => s.stock === 'IBM');
                    const tslaStock = res.body.stockData.find(s => s.stock === 'TSLA');

                    assert.equal(ibmStock.likes, initialLikesIBM + 1);
                    assert.equal(tslaStock.likes, initialLikesTSLA + 1);
                    initialLikesTSLA = tslaStock.likes;

                    assert.isString(ibmStock.price);
                    assert.isString(tslaStock.price);

                    done();
                });
        });

    });

});
