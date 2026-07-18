import { DaikinDiscovery } from '../../src';

// Real-network smoke test: broadcasts on the LAN and waits for live Daikin
// units to answer. Run on the home network via `npm run test:integration`.
describe('Test DaikinDiscovery (real network)', () => {
    it('Callback triggers', (done) => {
        new DaikinDiscovery(2, (_result) => {
            // console.log(JSON.stringify(result));
            done();
        });
    }, 10000);
});
