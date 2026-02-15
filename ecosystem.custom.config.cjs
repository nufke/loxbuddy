module.exports = {
  apps: [
    {
      name     : "loxbuddy",
      script   : "build/index.js",
      watch    : false,
      instances: "max",
      exec_mode: "cluster",
      node_args: "--env-file .env.local",
      env: {
        "PORT": 4004,
        "ORIGIN": "http://localhost:4004"
      }
    }
  ]
};
