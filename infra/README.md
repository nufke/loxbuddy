# Deploy LoxBuddy App to your server

This README explains how to deploy the LoxBuddy App to a server running NodeJS.

 1. Build the app on your development desktop using `npm run build`.
 2. After building the app, there should be a directory named `build`. Copy the entire
    directory to your web server directory, e.g., `/var/www/` into `/var/www/build`.
 3. Copy the files from the `infra` directory to `/var/www/`.
 4. Install all npm dependencies on your server: `npm install`.
 5. Update the environment variables in the file `ecosystem.custom.config.cjs`.
 6. Start PM2: `pm2 start ecosystem.custom.config.cjs`. If everything goes well,
    you should see a status table with all processes with status `online`.
 7. You can now access the LoxBuddy App at `http://localhost:4004`.
 8. In case of issues or errors, check the PM2 log files in `$HOME/.pm2/logs/`.

