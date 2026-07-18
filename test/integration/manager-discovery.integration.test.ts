import { DaikinManager } from '../../src';

// Real-network smoke test: discovers live units on the LAN and opens real HTTP
// connections to whichever answer. Run on the home network via
// `npm run test:integration`.
describe('Daikin AC Manager (real network)', () => {
    it('Looks for devices and finishes', (done) => {
        new DaikinManager({
            addDevicesByDiscovery: true,
            deviceDiscoveryWaitCount: 2,
            logInitialDeviceConnection: true,
            useGetToPost: false,
            initializeCB: (message) => {
                const success: boolean =
                    message == "Couldn't find any devices..." || message.indexOf('Finished Initialization with ') === 0;
                expect(success).toBeTruthy();
                done();
            },
        });
    }, 10000);
});
