import { json } from '@sveltejs/kit';
import dgram from 'node:dgram'
import type { DeviceInfoMap } from '$lib/types/models';

const data = Buffer.alloc(2);
const client = dgram.createSocket('udp4');
let resp: DeviceInfoMap = {};

client.on('connect', () => { console.log(`connected: ${client.remoteAddress().address}:${client.remoteAddress().port}`);});
client.on('close', () => { console.log('closed');});
client.on('error', (error) => { console.log('error', error); });

client.on('listening', () => {
  const addr = client.address();
  console.log(`client listening on ${addr.address}:${addr.port}`);
  client.setBroadcast(true);
  client.send(data, 0, data.length, 7070, '255.255.255.255');
});

client.on('message', (message) => {
  const msg = message.toLocaleString().split(' ');
  if (msg[0]=='LoxLIVE:') {
    resp[msg[3]] = {snr: msg[3], name: msg[1], ipaddr: msg[2]};
  }
});

client.bind(7071); // bind to Loxone devices

function timeout(delay: number) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

export async function GET() {
  resp = {};
  client.send(data, 0, data.length, 7070, '255.255.255.255');
  await timeout(2000); // collect responses for 2sec
  return json(resp);
}
