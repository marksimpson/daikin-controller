jest.mock('dgram', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { EventEmitter } = require('events');
    const createdSockets: FakeSocket[] = [];

    class FakeSocket extends EventEmitter {
        public readonly send = jest.fn();
        public readonly close = jest.fn();
        public readonly addMembership = jest.fn();
        public readonly setBroadcast = jest.fn();
        public readonly bind = jest.fn((_port: number, _address: string, callback?: () => void) => {
            callback?.();
        });
    }

    return {
        createSocket: jest.fn(() => {
            const socket = new FakeSocket();
            createdSockets.push(socket);
            return socket;
        }),
        __createdSockets: createdSockets,
    };
});

import * as dgram from 'dgram';
import type { EventEmitter } from 'events';
import { DaikinDiscovery } from '../src';

type FakeSocket = EventEmitter & {
    send: jest.Mock;
    close: jest.Mock;
    addMembership: jest.Mock;
    setBroadcast: jest.Mock;
    bind: jest.Mock;
};

// The mocked dgram module exposes every socket it hands out so the test can
// drive the socket lifecycle deterministically instead of relying on the LAN.
const createdSockets = (dgram as unknown as { __createdSockets: FakeSocket[] }).__createdSockets;

describe('Test DaikinDiscovery', () => {
    beforeEach(() => {
        createdSockets.length = 0;
    });

    it('finalises once the requested number of devices reply', (done) => {
        new DaikinDiscovery(2, (devices) => {
            expect(devices).toHaveLength(2);
            expect(devices.map((d) => d.ipAddress)).toEqual(['192.168.1.10', '192.168.1.11']);
            const socket = createdSockets[0];
            expect(socket.addMembership).toHaveBeenCalledWith('224.0.0.1');
            expect(socket.setBroadcast).toHaveBeenCalledWith(true);
            expect(socket.close).toHaveBeenCalledTimes(1);
            done();
        });

        const socket = createdSockets[0];
        socket.emit('listening');
        expect(socket.send).toHaveBeenCalledTimes(1);
        socket.emit('message', Buffer.from('reply'), { address: '192.168.1.10', port: 30050 });
        socket.emit('message', Buffer.from('reply'), { address: '192.168.1.11', port: 30050 });
    });

    it('finalises after exhausting its probes when nothing replies', (done) => {
        jest.useFakeTimers();
        new DaikinDiscovery(2, (devices) => {
            expect(devices).toHaveLength(0);
            jest.useRealTimers();
            done();
        });

        const socket = createdSockets[0];
        socket.emit('listening');
        // Ten probe attempts, one every 500ms, then discovery gives up.
        jest.advanceTimersByTime(500 * 10);
    });
});
