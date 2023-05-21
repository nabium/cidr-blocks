CIDR Blocks
============================================================

Overview
------------------------------------------------------------

CIDR Blocks is an web application which shows
CIDR block of the specified IPv4 network or range of IPv4 addresses.


Build
------------------------------------------------------------

```
git clone https://github.com/nabium/cidr-blocks.git
cd cidr-blocks
npm ci
npm run build
```

Deploy or run artifacts at `cidr-blocks/build`.

You can `npm start` instead of `npm run build` to run the application in local server


Usage
------------------------------------------------------------

Enter host/network address.

- CIDR - `192.168.1.0/24`
- range of IPv4 - `192.168.1.0-192.168.1.255`
- IPv4 with netmask - `192.168.1.0 netmask 255.255.255.0`

Click `OK`, and the app will show CIDR block containing the network
and CIDR blocks within the network.
