import nock = require('nock');
import { DaikinManager } from '../src';
import { DaikinDiscovery } from '../src/DaikinDiscovery';
import { DeviceInfo } from '../src/DaikinManager';

jest.mock('../src/DaikinDiscovery');

const MockedDiscovery = DaikinDiscovery as jest.MockedClass<typeof DaikinDiscovery>;

// A live basic_info / get_model_info pair for a device that connects cleanly.
const basicInfo =
    'ret=OK,type=aircon,reg=eu,dst=1,ver=2_6_0,pow=0,err=0,location=0,name=%4b%6c%69%6d%61%20%4a%61%6e%61,icon=0,method=home only,port=30050,id=,pw=,lpw_flag=0,adp_kind=2,pv=0,cpv=0,cpv_minor=00,led=0,en_setzone=1,mac=A408EACC91D4,adp_mode=run,en_hol=0,grp_name=%4b%69%6e%64%65%72,en_grp=1,ssid1=(/) (°,,°) (/)';
const modelInfo = 'ret=OK,model=NOTSUPPORT,type=N,pv=0,cpv=0,mid=NA,s_fdir=1,en_scdltmr=1';

function discoveryReturns(devices: DeviceInfo[]): void {
    MockedDiscovery.mockImplementation((_waitForCount: number, callback: (found: DeviceInfo[]) => void) => {
        callback(devices);
        return {} as DaikinDiscovery;
    });
}

describe('Daikin AC Manager', () => {
    afterEach(() => {
        nock.cleanAll();
        MockedDiscovery.mockReset();
    });

    it('Initialises the devices discovery returns', (done) => {
        discoveryReturns([{ name: 'discovered', ipAddress: '127.0.0.1' }]);
        nock('http://127.0.0.1')
            .get('/common/basic_info')
            .reply(200, basicInfo)
            .get('/aircon/get_model_info')
            .reply(200, modelInfo);

        new DaikinManager({
            addDevicesByDiscovery: true,
            deviceDiscoveryWaitCount: 2,
            logInitialDeviceConnection: false,
            useGetToPost: false,
            initializeCB: (message) => {
                expect(message).toEqual('Finished Initialization with 1 connected and 0 failed Devices.');
                done();
            },
        });
    });

    it('Reports when discovery finds no devices', (done) => {
        discoveryReturns([]);

        new DaikinManager({
            addDevicesByDiscovery: true,
            deviceDiscoveryWaitCount: 2,
            logInitialDeviceConnection: false,
            useGetToPost: false,
            initializeCB: (message) => {
                expect(message).toEqual("Couldn't find any devices...");
                done();
            },
        });
    });

    it('Looks for a device but fails to find it', (done) => {
        // Fail the connection attempt immediately instead of waiting out the
        // real 10s request timeout against an unroutable address.
        nock('http://1.2.3.4')
            .persist()
            .get(/.*/)
            .replyWithError({ message: 'connect EHOSTUNREACH 1.2.3.4:80', code: 'EHOSTUNREACH' });
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
