import mqtt from "mqtt"
import { structure, state } from "$lib/stores/stores";

let connected;
export let mqttclient:any;

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
    connected = mqttclient.connected;
    //throw error
  });

  mqttclient.on("close", () => {
    console.log("MQTT disconnected");
    connected = mqttclient.connected;
  });
}

const onConnect = () => {
  console.log("MQTT: connected\n");
  const registerTopics = ["loxone/+/states", "loxone/+/structure", "loxone/+/#"];

  registerTopics.forEach((topic) => {
    console.log('regoster', topic);
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

export async function sendTopic() {
  const retain = true;
  const qos = 1;

  if (mqttclient.connected) {
    //mqtt.publish('test123', 'online', { retain, qos })
  }
}

function monitorStructure(topic: string, msg: string) {
  const regex = new RegExp("loxone/(.*)/structure");
  const found = topic.match(regex);
  if (found && found[1]) {
    //console.log('structure', msg);
    structure.set(JSON.parse(msg));
  }
}

function monitorInitialStates(topic: string, msg: string) {
  const regex = new RegExp("loxone/(.*)/states");
  const found = topic.match(regex);
  if (found && found[1]) {
    const regex2 = new RegExp( "loxone/" + found[1] + "/", "g"); // TODO replace stored states at server 
    msg = msg.replace(regex2, "");
    state.set(JSON.parse(msg))
  }
}

function monitorStates(topic: string, msg: string) {
  const regex = new RegExp("loxone/(.*)/(.*)");
  const found = topic.match(regex);
  const data = msg.length ? msg : "<empty>";
  if (found && found[1] && found[2]) {
    state.update((state) => state = { ...state, [found[2]]: msg} );
  }
}
