<img style="float: right;" src="./static/icons/loxbuddy_64.png">
# LoxBuddy

LoxBuddy is a modern and fast (Web)App to control your [Loxone](https://www.loxone.com/) and [LoxBerry](https://wiki.loxberry.de/start) based Smart Home.

LoxBuddy uses MQTT for monitoring and control. All devices available via MQTT can be controlled using LoxBuddy. The additional [Lox2MQTT](https://github.com/nufke/LoxBerry-Plugin-Lox2MQTT) plugin for LoxBerry is recommended for a seamless integration of your Loxone Miniserver into MQTT.

**NOTE: The LoxBuddy App is in early developement, thus unstable and incomplete. Use it at your own risk.**

## Development environment

To help in the development of this App, you need a NodeJS installation on your desktop. Requirement is node >= v20.11.1. The application is based on [Svelte](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/) and [Skeleton](https://www.skeleton.dev/). 

```
# install
git clone https://github.com/nufke/loxbuddy.git
cd loxbuddy
npm install

# update environment variables (MQTT settings)
cp .env.example .env.local
code .env.local

# copy icons to static folder 
cp <path to loxicons> ./static/loxicons

# launch server
npm run dev

# launch the browser 
firefox http://localhost:5173/
```

## Issues and questions

Please submit your issues and questions via the GitHub issue tracker: https://github.com/nufke/loxbuddy/issues

## Buy Me A Coffee

Interested in supporting the development of this App?

<a href="https://www.buymeacoffee.com/nufke" target="_blank"><img src="./static/icons/svg/bmc.svg" alt="Buy Me A Coffee"></a>
