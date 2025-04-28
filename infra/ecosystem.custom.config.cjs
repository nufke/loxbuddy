module.exports = {
  apps: [
    {
      name     : "loxbuddy",
      script   : "build/index.js",
      watch    : false,
      instances: "max",
      exec_mode: "cluster",
      env: {
        "PORT": "4004",
        "MQTT_HOSTNAME": "IP_address",
        "MQTT_PORT": "websocket_port",
        "MQTT_USERNAME": "username",
        "MQTT_PASSWORD": "password"
      }
    }
  ],
};
