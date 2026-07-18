import nock = require('nock');
import { DaikinManager } from '../src';

describe('Daikin AC Manager', () => {
    afterEach(() => {
        nock.cleanAll();
    });

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
    it('Looks for a device but fails to find it', (done) => {
        // Fail the connection attempt immediately instead of waiting out the
        // real 10s request timeout against an unroutable address.
        nock('http://1.2.3.4').persist().get(/.*/).replyWithError({ message: 'connect EHOSTUNREACH 1.2.3.4:80', code: 'EHOSTUNREACH' });
        new DaikinManager({
            deviceList: { testDevice: '1.2.3.4' },
            logInitialDeviceConnection: true,
            useGetToPost: false,
            initializeCB: (message) => {
                expect(message).toEqual('Finished Initialization with 0 connected and 1 failed Devices.');
                done();
            },
        });
    }, 10000);
});
