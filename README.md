<img src="./static/icons/loxbuddy_64.png">

# LoxBuddy 

LoxBuddy is a modern and fast (Web)App to control your [Loxone](https://www.loxone.com/) and [LoxBerry](https://wiki.loxberry.de/start) based Smart Home.

LoxBuddy uses MQTT for monitoring and control. All devices available via MQTT can be controlled using LoxBuddy. The [Lox2MQTT](https://github.com/nufke/LoxBerry-Plugin-Lox2MQTT) plugin for LoxBerry is recommended for a seamless integration of your Loxone Miniserver using MQTT.

**NOTE: The LoxBuddy App is in early developement, thus unstable and incomplete. Use it at your own risk.**

## Development environment

To help in the development of this App, you need a NodeJS installation on your desktop. Requirement is node &ge; v20.11.1. The application is based on [Svelte](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/) and [Skeleton](https://www.skeleton.dev/). 

```bash
# install
git clone https://github.com/nufke/loxbuddy.git
cd loxbuddy
npm install

# update environment variables (MQTT settings)
cp .env.example .env.local
code .env.local

# copy icons to static folder 
cp <path to loxicons> ./static/loxicons

# launch development server
npm run dev

# launch the browser 
firefox http://localhost:5173/
```

## Deployment to a webserver

To deploy LoxBuddy to a webserver (e.g. running on LoxBerry), follow the steps described in this [README](./infra/README.md)

## Issues and questions

Please submit your issues and questions via the GitHub issue tracker: https://github.com/nufke/loxbuddy/issues

## Credits

Special thanks and credits to:

 * [Svelte team](https://svelte.dev/)
 * [Skeleton team](https://www.skeleton.dev/)
 * [iro.js](https://github.com/jaames/iro.js) of James Daniel
 * [Svelty Picker](https://github.com/mskocik/svelty-picker) of Martin Skočík
 * [Meteocons](https://github.com/basmilius/weather-icons) of Bas Milius

## Buy Me A Coffee

Interested in supporting the development of this App?

<a href="https://www.buymeacoffee.com/nufke" target="_blank"><img src="./static/icons/svg/bmc.svg" alt="Buy Me A Coffee"></a>
