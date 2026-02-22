import dns from 'node:dns/promises';
import tls from 'node:tls';
import ipaddr from 'ipaddr.js';
import { Agent } from 'undici';

export class NotPublicIPError extends Error {
  constructor(hostname: string) {
    super(`address ${hostname} does not have a public ip`);
  }
}

const isPublic = (ip: string) => {
  if (!ipaddr.isValid(ip)) return false;

  let parsed = ipaddr.parse(ip);

  if (parsed.kind() === 'ipv6' && (parsed as ipaddr.IPv6).isIPv4MappedAddress()) {
    parsed = (parsed as ipaddr.IPv6).toIPv4Address();
  }

  const blocked = [
    'loopback',
    'private',
    'linkLocal',
    'uniqueLocal',
    'reserved',
    'broadcast',
    'carrierGradeNat',
    'unspecified',
    'multicast',
  ];

  return !blocked.includes(parsed.range());
};

const client = new Agent({
  connections: 100,
  keepAliveTimeout: 10_000,
  keepAliveMaxTimeout: 60_000,

  connect(opts, callback) {
    dns
      .lookup(opts.hostname, { all: true })
      .then((records) => {
        const publicIPs = records.filter((r) => isPublic(r.address));
        if (publicIPs.length === 0) {
          return callback(new NotPublicIPError(opts.hostname), null);
        }

        let finished = false;
        const done = (err?: Error, sock?: tls.TLSSocket) => {
          if (finished) return;
          finished = true;
          if (err) {
            return callback(err, null);
          }

          callback(null, sock!);
        };

        const tryConnect = (i: number) => {
          if (i >= publicIPs.length) {
            return done(new Error('all resolved ips failed'));
          }

          const socket = tls.connect({
            host: publicIPs[i].address,
            port: Number(opts.port) || 443,
            servername: opts.hostname,
            ALPNProtocols: ['http/1.1'],
          });

          socket.once('secureConnect', () => done(undefined, socket));
          socket.once('timeout', () => {
            socket.destroy();
            tryConnect(i + 1);
          });
          socket.once('error', (err) => {
            console.error('socket error', err);
            socket.destroy();
            tryConnect(i + 1);
          });
        };

        tryConnect(0);
      })
      .catch((err) => callback(err as Error, null));
  },
});

export default client;
