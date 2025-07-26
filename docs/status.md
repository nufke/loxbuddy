# Status

This page lists the development status of the controls and subcontrols, and future requirements and features.
For additional requests or ideas, you can raise an [issue](https://github.com/nufke/loxbuddy/issues) 
or submit a [pull request](https://github.com/nufke/loxbuddy/pulls).

## Controls

| (Sub)Control             | Status            | Remarks                     |
|--------------------------|-------------------|-----------------------------|
| AalEmergency             | Not started       |                             |
| AalSmartAlarm            | Not started       |                             |
| ACControl                | Not started       |                             |
| Alarm                    | Available         |                             |
| AlarmCentral             | Not started       |                             |
| AlarmChain               | Not started       |                             |
| AlarmClock               | Available         |                             |
| Athene                   | Not started       |                             |
| Application              | Not started       |                             |
| AudioPlayerGroup         | Not started       |                             |
| AudioZone                | Not started       |                             |
| AudioZoneCentral         | Not started       |                             |
| AudioZoneV2              | Not started       |                             |
| CarCharger               | Not started       |                             |
| CentralAlarm             | Not started       |                             |
| CentralAudioZone         | Not started       |                             |
| CentralGate              | Not started       |                             |
| CentralJalousie          | Available         |                             |
| CentralLightController   | Available         |                             |
| CentralWindow            | Not started       |                             |
| Climate                  | Not started       |                             |
| ClimateUs                | Not started       |                             |
| ClimateController        | Not started       |                             |
| ClimateControllerUS      | Not started       |                             |
| ColorPicker              | Not started       |                             |
| ColorPickerV2            | Available         |                             |
| Daytimer                 | Available         |                             |
| Dimmer                   | Available         |                             |
| EIBDimmer                | Not started       |                             |
| EnergyFlowMonitor        | Not started       |                             |
| EFM                      | Not started       |                             |
| EnergyManager            | Not started       |                             |
| EnergyManager2           | Not started       |                             |
| Fronius                  | Under development | No statistics planned       |
| Gate                     | Under development |                             |
| GateCentral              | Not started       |                             |
| Heatmixer                | Not started       |                             |
| Hourcounter              | Not started       |                             |
| InfoOnlyAnalog           | Available         |                             |
| InfoOnlyDigital          | Available         |                             |
| InfoOnlyText             | Available         |                             |
| InfoView                 | Not started       |                             |
| Intercom                 | Under development | No SIP communication yet    |
| IntercomV2               | Not started       |                             |
| IRCDaytimer              | Not started       |                             |
| IRCV2Daytimer            | Not started       |                             |
| IRoom                    | Not started       |                             |
| IRoomController          | Under development |                             |
| IRoomControllerV2        | Under development |                             |
| IRoomControllerV2021     | Not started       |                             |
| Irrigation               | Not started       |                             |
| Jalousie                 | Available         |                             |
| LeftRightAnalog          | Not started       |                             |
| LeftRightDigital         | Not started       |                             |
| Light                    | Not started       |                             |
| LightCentral             | Not started       |                             |
| LightController          | Not started       |                             |
| LightControllerV2        | Available         |                             |
| LightsceneRGB            | Not started       |                             |
| LightV2                  | Not started       |                             |
| LoadManager              | Not started       |                             |
| MailBox                  | Not started       |                             |
| Media                    | Not started       |                             |
| MediaClient              | Not started       |                             |
| Meter                    | Under development | No statistics yet           |
| MeterV2                  | Not started       |                             |
| MultifunctionSW          | Not started       |                             |
| NFCCodeTouch             | Not started       |                             |
| Pool                     | Not started       |                             |
| PoolController           | Not started       |                             |
| PoolDaytimer             | Not started       |                             |
| PowerUnit                | Not started       |                             |
| Presence                 | Not started       |                             |
| PresenceController       | Not started       |                             |
| PresenceDetector         | Under development |                             |
| PulseAt                  | Not started       |                             |
| Pushbutton               | Available         |                             |
| Radio                    | Available         |                             |
| Remote                   | Not started       |                             |
| Sauna                    | Not started       |                             |
| Sequential               | Not started       |                             |
| Slider                   | Available         |                             |
| SmokeAlarm               | Available         |                             |
| SolarPump                | Not started       |                             |
| SolarPumpController      | Not started       |                             |
| SpotPriceOptimizer       | Not started       |                             |
| StairwayLS               | Not started       |                             |
| Steak                    | Not started       |                             |
| SteakThermo              | Not started       |                             |
| Switch                   | Available         |                             |
| SystemScheme             | Not started       |                             |
| TextInput                | Not started       |                             |
| TextState                | Available         |                             |
| TimedSwitch              | Under development |                             |
| Tracker                  | Not started       |                             |
| UpDownAnalog             | Not started       |                             |
| UpDownDigital            | Available         |                             |
| UpDownLeftRightAnalog    | Not started       |                             |
| UpDownLeftRightDigital   | Not started       |                             |
| ValueSelector            | Available         |                             |
| Ventilation              | Not started       |                             |
| Wallbox2                 | Not started       |                             |
| Webpage                  | Available         |                             |
| Weather                  | Not started       |                             |
| Window                   | Not started       |                             |
| WindowMonitor            | Available         |                             |
| Universal                | Not started       |                             |

## Feature list under development

| Feature                     | Status                   |
|-----------------------------|--------------------------|
| 12h clock notation          | Not started              |
| Alarm sync w mobile alarm   | Not started              |
| Battery status update       | Not started              |
| Calendar                    | Not started              |
| Connection status           | Available                |
| Dark / Light themes         | Available                |
| Internationalization        | Available (NL, DE, US)   |
| Kiosk / room mode (tablet)  | Not started              |
| LoxBerry plugins            | Not started              |
| Notifications (local)       | Available                |
| Pin protected pages         | Not started              |
| Push messages (internet)    | Not started              |
| Screensaver / Lockscreen    | Available                |
| Settings menu               | Under development        |
| Splashscreen                | Not started              |
| Statistics / history        | Not started              |
| Statusbar (time, temp, etc) | Available                |
| System messages             | Available                |
| Voice control               | Not started              |
| Weather forecast            | Available (Weather4Lox)  |

## Other ideas

 * Region dependent number formatting or scientific notation (e.g. 1000000 displayed as 1.000.000 or 1,000,000 or 1E+06 )
 * Option to disable control pushdown to detailed level
 * Temperature notation (°C / °F)
 * Interface with Synology DSM (e.g. Surveillance Station)
 * Biometic control / screen unlock (e.g. TouchID, FaceID)
 * Near Field Communcation
 * QR code scanning
