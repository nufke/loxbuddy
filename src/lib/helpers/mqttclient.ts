import mqtt from "mqtt"
import { structure, state } from "$lib/stores/stores";

let connected: boolean;
let serialNr: string;  // TODO support multiple miniservers
let prefix = 'loxone'; // TODO configure prefix in GUI

export let mqttclient:any = null;

export const mqttConnect = (env: any) => {
  const mqttOptions = {
    hostname: env.MQTT_HOSTNAME || 'localhost',
    port: env.MQTT_PORT ? parseInt(env.MQTT_PORT) : 1883,
    connectTimeout: 5000,
    username: env.MQTT_USERNAME,
    password: env.MQTT_PASSWORD
  }
  mqttclient = mqtt.connect(mqttOptions);
  mqttclient.on("connect", onConnect);

  mqttclient.on("message", onMessage);

  mqttclient.on("error", (error:any) => {
    console.log("error.name", error.name);
    mqttclient.end();
    connected = false;
    //throw error
  });

  mqttclient.on("close", () => {
    console.log("MQTT disconnected");
    connected = false;
  });
}

const onConnect = () => {
  console.log("MQTT: connected\n");
  connected = true;
  const registerTopics = ["loxone/+/states", "loxone/+/structure", "loxone/+/#"];

  registerTopics.forEach((topic) => {
    mqttclient.subscribe(topic, function (err:any) {
      if (err) {
        console.error(err);
      } else {
        console.log(`MQTT subscribed on topic '${topic}'`);
      }
    });
  });
};

//TODO check type of arguments
const onMessage = (topic: string, message: any) => {
  //console.log('MQTT: message received\n');
  const msg = message.toString();
  monitorStructure(topic, msg);
  monitorInitialStates(topic, msg);
  monitorStates(topic, msg);
};

export async function reconnect() {
  mqttclient.reconnect();
}

export const publishTopic = (uuid: string, msg: string) => {
  const retain = true;
  const qos = 1;

  if (connected && serialNr) {
    const topic = prefix + '/' + serialNr + '/' + uuid + "/cmd";
    console.log('MQTT publish:' , topic, msg);
    mqttclient.publish(topic, msg, { retain, qos });
  }
};

function monitorStructure(topic: string, msg: string) {
  const regex = new RegExp(prefix + "/(.*)/structure");
  const found = topic.match(regex);
  if (found && found[1]) {
    //console.log('structure', msg);
    structure.set(JSON.parse(msg));
    serialNr = found[1];
    console.log('miniserver registered', serialNr);
  }
}

function monitorInitialStates(topic: string, msg: string) {
  const regex = new RegExp(prefix + "/(.*)/states");
  const found = topic.match(regex);
  if (found && found[1]) {
    const regex2 = new RegExp( "loxone/" + found[1] + "/", "g"); // TODO replace stored states at server 
    msg = msg.replace(regex2, "");
    //console.log('states', topic, msg);
    state.set(JSON.parse(msg))
  }
}

function monitorStates(topic: string, msg: string) {
  const regex = new RegExp(prefix + "/(.*)/(.*)");
  const found = topic.match(regex);
  const data = msg.length ? msg : "<empty>";
  if (found && found[1] && found[2]) {
    //console.log('state', topic, msg);
    state.update((state) => state = { ...state, [found[2]]: msg} );
  }
}
