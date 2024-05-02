import { DaikinAC } from './DaikinAC';
import { DaikinACOptions, Logger } from './DaikinACRequest';
import { DaikinDiscovery } from './DaikinDiscovery';

export interface DeviceInfo {
    name: string;
    ipAddress: string;
    controllerKey?: string;
}

export interface DaikinManagerOptions {
    addDevicesByDiscovery?: boolean;
    deviceDiscoveryWaitCount?: number;
    // Name can be chosen individually, value should be the device IP e.g. 192.168.0.100
    deviceList?: { [name: string]: string };
    deviceInfoList?: DeviceInfo[];
    logger?: Logger;
    useGetToPost?: boolean;
    logInitialDeviceConnection: boolean;
    initializeCB?: (message: string) => void;
}

export class DaikinManager {
    public devices: { [name: string]: DaikinAC } = {};
    public daikinAcOptions: DaikinACOptions;
    public managerOptions: DaikinManagerOptions;

    public constructor(options: DaikinManagerOptions) {
        this.daikinAcOptions = { logger: options.logger, useGetToPost: options.useGetToPost };
        this.managerOptions = options;
        if (options.addDevicesByDiscovery) {
            this.startDiscovery(options.deviceDiscoveryWaitCount ?? 2);
        } else {
            if (options.deviceList && options.deviceInfoList) {
                throw new Error('Specify one or none of deviceList and deviceInfoList');
            }

            let deviceInfoList: DeviceInfo[];
            if (options.deviceList) {
                var deviceList: { [name: string]: string } = options.deviceList;
                deviceInfoList = Object.keys(deviceList).map((name) => {
                    return { name: name, ipAddress: deviceList[name] };
                });
            } else if (options.deviceInfoList) {
                deviceInfoList = options.deviceInfoList;
            } else {
                throw new Error('Created without providing device List or allowing Auto Discover');
            }

            this.addDevices(deviceInfoList, options.logInitialDeviceConnection);
        }
    }

    private addDevices(devices: DeviceInfo[], logInitialDeviceConnection: boolean = false): void {
        const expectedAmount: number = devices.length;
        let connectedAmount: number = 0;
        let triedAmmount: number = 0;
        for (const deviceInfo of devices) {
            const ip = deviceInfo.ipAddress;
            const name = deviceInfo.name;
            this.devices[name] = new DaikinAC(deviceInfo, this.daikinAcOptions, (err, res) => {
                if (err === null) connectedAmount++;
                if (++triedAmmount == expectedAmount) {
                    this.managerOptions.initializeCB?.(
                        `Finished Initialization with ${connectedAmount} connected and ${
                            expectedAmount - connectedAmount
                        } failed Devices.`,
                    );
                }
                if (logInitialDeviceConnection) {
                    if (err !== null) {
                        console.log(`Initial connection to "${name}" at address "${ip}" failed: ${err}`);
                    } else {
                        console.log(
                            `Initial connection to "${name}" at address "${ip}" succeeded: ${JSON.stringify(res)}`,
                        );
                    }
                }
            });
        }
    }

    private startDiscovery(deviceDiscoveryWaitCount: number): void {
        new DaikinDiscovery(deviceDiscoveryWaitCount, (devices) => {
            if (Object.keys(devices).length !== 0) {
                this.addDevices(devices);
                return;
            }
            this.managerOptions.initializeCB?.("Couldn't find any devices...");
        });
    }
}
