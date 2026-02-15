<img src="./static/icons/loxbuddy_64.png">

# LoxBuddy 

LoxBuddy is a modern and fast (Web)App to control your [Loxone](https://www.loxone.com/) and [LoxBerry](https://wiki.loxberry.de/start) based Smart Home. The user interface is optimized for mobile and tablet usage.

LoxBuddy establishes a WebSocket connection to your Miniserver to control and monitor the state of the available controls. In addition, LoxBuddy can interface with LoxBerry using MQTT.

**WARNING: The LoxBuddy App is in early developement, thus unstable and incomplete, and may impact the stability of your Smart Home. Use it at your own risk.**

## Screenshots

<div class="flex flex-row gap-3">
  <img src="https://github.com/nufke/loxbuddy/blob/main/docs/screenshot_mobile_home.png" height=800 alt="Screenshot Mobile Home">
  <img src="https://github.com/nufke/loxbuddy/blob/main/docs/screenshot_mobile_heating.png" height=800 alt="Screenshot Mobile Heating">
</div>

[More screenshots](https://github.com/nufke/loxbuddy/wiki/Screenshots)

## Development environment

To help in the development of this App, you need a Node.js installation on your desktop. Requirement is Node.js &ge; v22.20.0 (LTS). The LoxBuddy application is based on [Svelte](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/) and [Skeleton](https://www.skeleton.dev/). 

```bash
# install
git clone https://github.com/nufke/loxbuddy.git
cd loxbuddy
npm install

# update environment variables (MQTT settings)
cp .env.example .env.local
code .env.local

# launch development server
npm run dev
```

You can access LoxBuddy by navigating to <http://localhost:5173> in a web browser.

## Deployment using Docker (recommended)

To deploy LoxBuddy in a Docker container, make sure you have [Docker Desktop](https://www.docker.com/) installed on your system, and execute the following commands:

```bash
docker build -t loxbuddy .
docker run -p 3000:3000 loxbuddy
```

You can now access LoxBuddy by navigating to <http://localhost:3000> in a web browser.

Note that the environment variables from the `env.local` are not picked up by the Docker container. You can pass environment variables to the container with the `-e` (alias `--env`) flag.

## Deployment using the Node.js process manager (pm2)

Mke sure you have `pm2` installed globally on your system:

```bash
npm install pm2 -g      # global installation only required once
```

You can now start, restart, stop, etc. the LoxBuddy App using one of the following `pm2` commands:

```bash
npm run pm2:start       # Build and start LoxBuddy App
npm run pm2:restart     # Rebuild and restart LoxBuddy App
nom run pm2:stop        # stop LoxBuddy App, but keep associated pm2 process
npm run pm2:delete      # stop LoxBuddy App and delete associated pm2 process
npm run pm2:kill        # stop LoxBuddy App, kill all running pm2 processes
npm run pm2:list        # list all pm2 processes
npm run pm2:logs        # show logs for all pm2 processes
npm run pm2:status      # show status of all pm2 processes
```

You can now access LoxBuddy by navigating to <http://localhost:4004> in a web browser.

## Supported controls and features

Visit the [Wiki Status](https://github.com/nufke/loxbuddy/wiki/Status) page for the latest updates on supported controls and features.

## Issues and requests

Please submit your issues or requests via the GitHub [issue tracker](https://github.com/nufke/loxbuddy/issues) 
or submit a [pull request](https://github.com/nufke/loxbuddy/pulls).

## Credits

Special thanks and credits to:

 * [Svelte team](https://svelte.dev/)
 * [Skeleton team](https://www.skeleton.dev/)
 * [Iconify team](https://iconify.design/)
 * [iro.js](https://github.com/jaames/iro.js) of James Daniel
 * [Svelty Picker](https://github.com/mskocik/svelty-picker) of Martin Skočík
 * [Meteocons](https://github.com/basmilius/weather-icons) of Bas Milius

## Disclaimer

Although the developer followed the [official documentation](https://www.loxone.com/wp-content/uploads/datasheets/StructureFile.pdf), use this application at your own risk.

## Buy Me A Coffee

Interested in supporting the development of this App?

<a href="https://www.buymeacoffee.com/nufke" target="_blank"><img src="./static/icons/svg/bmc.svg" alt="Buy Me A Coffee"></a>
