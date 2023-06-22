const SteamCommunity = require("steamcommunity");
const SteamTotp = require("steam-totp");
const steam = new SteamCommunity();

require("dotenv").config();

const logOnOptions = {
  accountName: process.env.STEAM_USERNAME,
  password: process.env.PASSWORD,
  twoFactorCode: SteamTotp.getAuthCode(process.env.SHARED_SECRET),
};

const pollingInterval = 30000;

steam.login(logOnOptions, function (err) {
  if (err) {
    // It's better to know what's happening
    console.log(`Error logging in with steam\n ${err}`);
    throw err;
  }

  console.log(`Successfully loggedin as ${process.env.STEAM_USERNAME}`);
  setInterval(() => {
    const time = SteamTotp.time();
    const confKey = SteamTotp.getConfirmationKey(
      process.env.IDENTITY_SECRET,
      time,
      "conf"
    );
    const allowKey = SteamTotp.getConfirmationKey(
      process.env.IDENTITY_SECRET,
      time,
      "allow"
    );

    steam.getConfirmations(time, confKey, function (err, confirmations) {
      if (err) {
        // Tell me whhat happened
        console.log(`Error during confirmations: ${err.message}`);
        throw err;
      }

      if (confirmations && confirmations.length > 0) {
        console.log(confirmations);
        steam.acceptAllConfirmations(time, confKey, allowKey, function (err) {
          if (err) {
            console.log(err);
            throw err;
          }

          // TODO: Throwing error here have some problem with syncing?
          // throw err;
        });
      } else {
        console.log(`No active confirmation`);
      }
      return;
    });
  }, pollingInterval);
});
