<img src="./static/icons/loxbuddy_64.png">

# LoxBuddy 

LoxBuddy is a modern and fast (Web)App to control your [Loxone](https://www.loxone.com/) and [LoxBerry](https://wiki.loxberry.de/start) based Smart Home.

LoxBuddy establishes a WebSocket connection to your Miniserver to control and monitor the state of the available controls. In addition, LoxBuddy can interface with LoxBerry using MQTT.

**WARNING: The LoxBuddy App is in early developement, thus unstable and incomplete, and may impact the stability of your Smart Home. Use it at your own risk.**

## Development environment

To help in the development of this App, you need a Node.js installation on your desktop. Requirement is Node.js &ge; v22.20.0 (LTS). The LoxBuddy application is based on [Svelte](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/) and [Skeleton](https://www.skeleton.dev/). 

```bash
# install
git clone https://github.com/nufke/loxbuddy.git
cd loxbuddy
npm install

# update environment variables (Miniserver login and MQTT settings)
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

## Disclaimer

Although the developer followed the [official documentation](https://www.loxone.com/wp-content/uploads/datasheets/StructureFile.pdf), use this application at your own risk.

## Buy Me A Coffee

Interested in supporting the development of this App?

<a href="https://www.buymeacoffee.com/nufke" target="_blank"><img src="./static/icons/svg/bmc.svg" alt="Buy Me A Coffee"></a>
