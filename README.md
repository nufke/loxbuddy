<img src="./static/icons/loxbuddy_64.png">

# LoxBuddy 

LoxBuddy is a modern and fast (Web)App to control your [Loxone](https://www.loxone.com/) and [LoxBerry](https://wiki.loxberry.de/start) based Smart Home.

LoxBuddy uses MQTT for monitoring and control. All devices available via MQTT can be controlled using LoxBuddy. The [Lox2MQTT](https://github.com/nufke/LoxBerry-Plugin-Lox2MQTT) plugin for LoxBerry is recommended for a seamless integration of your Loxone Miniserver using MQTT.

**WARNING: The LoxBuddy App is in early developement, thus unstable and incomplete, and may impact the stability of your Smart Home. Use it at your own risk.**

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

# Unzip the `IconLibrary.zip` in the static folder 
cd static/loxicons
unzip IconLibrary.zip

# launch development server
npm run dev

# launch the browser 
firefox http://localhost:5173/
```

## Install the Lox2MQTT plugin

It is recommended to use the [Lox2MQTT](https://github.com/nufke/LoxBerry-Plugin-Lox2MQTT) plugin for LoxBerry for a seamless integration into your Loxone system. Lox2MQTT version 0.8.1 or later is required.

Make sure you enable the following options in Lox2MQTT:

* Publish structure: this is required to load the controls in LoxBuddy
* Publish control state changes: this is required to get control updates
* Retain published control states: this is required to capture the latest published states
* Subscribe to MQTT to control the Miniserver: this is required to control your Miniserver using LoxBuddy

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
