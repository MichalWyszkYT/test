# optifineProxy
#### Self-MITM requests to OptiFine's cape server!
![Screenshot of optifineProxy showing custom capes and player models](https://adryd.co/Esb9G)
> The fox ears player model shown above is originaly by [@Adeon](https://twitter.com/Adeon) and was manually ported to optifineProxy. The bee player model was taken from [optifine.net/items/hat_bee/model.cfg](http://optifine.net/items/hat_bee/model.cfg) and [optifine.net/items/hat_bee/users/sp614x.png](http://optifine.net/items/hat_bee/users/sp614x.png).

## Usage Rules

To respect sp614x's donations please do not:
 - host public instances.
 - host instances with more than 20 people.
 - use this software for commercial reasons or for profit.  

If you make any changes, feel free to open a pull request.  

#### Notice

For some reason, cape rendering in either Minecraft or OptiFine is blocking, so be careful that your server stays up, or people who use your optifineProxy instance will not have their world render, and players will not have skins.

Perhaps I should open an issue about this with Minecraft or OptiFine, but oh well

## Setup

#### Cloning and starting

```sh
git clone https://github.com/adryd325/optifineProxy
cd ./optifineProxy
npm install
# Set configs in config.js and users.js
npm run
```

#### Proxy (optional)

optifineProxy runs optimally behind nginx or another proxy that provides the X-Real-IP header, but will work without one.  
**Without a nginx or an other reverse-proxy, optifineProxy must run on port 80.**  

The config below will create a server that listens for Host: s.optifine.net and points requests to optifineProxy (after setting appropriate headers). This config assumes nginx is running on the same machine as optifineProxy, and that optifineProxy is running on port 8080.  

```
server {
    listen 80;
    listen [::]:80;
    server_name s.optifine.net;
    
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://127.0.0.1:8080;
    }
}
```

#### Changing DNS

##### Method 1: Hosts file

Add a record to the end of your hosts file (located /etc/hosts on \*nix or C:\WINDOWS\System32\drivers\etc\hosts on Windows) pointing `s.optifine.net` to the IP of your optifineProxy instance.  

```
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1       localhost
255.255.255.255	broadcasthost
::1             localhost
# if optifineProxy and nginx are running on the local machine
127.0.0.1       s.optifine.net
# if a friend is hosting an optifineProxy instance
(friends ip)    s.optifine.net
# or
142.112.151.178 s.optifine.net
```

##### Method 2: DNS Server

If you have access to a DNS server, you can create a record pointing `s.optifine.net` to the IP of your optifineProxy instance.  
An example with pfSense's DNS Forwarder is shown below.  

![Screenshot of pfSense with s.optifine.net pointing to optifineProxy](https://adryd.co/tzvVm)

## Configuration and data

#### Configs

config.js  
`// NOTE: I made the configs JS files so I can use comments and JS's styling. `
```js 
module.exports = {
    defaultPrefs: {
        // Blocks banner capes by detecting their size 
        blockBannerCapes: false, 
        
        // Blocks the classic "OF" capes by detecting their size
        blockClassicCapes: false, 
        
        // Blocks custom capes made by sp614x and given to his friends
        // There's not really an easy way to detect this, so it's done with a hardcoded list
        blockOFCustomCapes: false,
        
        // Blocks custom player models
        // (s.optifine.net/items/*)
        blockPlayerModels: false, 
        
        // Blocks remote configs
        // these are used to serve player models, but I'm not sure if they're used for 
        // anything else, so I made it configurable
        blockRemoteConfig: false,
        
        // Blocks requests otherwise unhandled by the proxy
        blockUnhandledRequests: true,
        
        // Specifies the folder in which capes, models and other data is stored
        dataFolder: 'data', 
        
        // Allows serving of custom models in the data folder
        allowCustomPlayerModels: true,
    },
    
    // The port that optifineProxy listens on. 
    // This must be port 80 if it's not behind a proxy
    listenPort: 8080,
};
```

users.js
```js
const ipAddresses = {
    // Depending on one's IP, they are assigned different configs
    // I seperated IPs from their configs so that one user can have multiple IPs
    '10.0.0.50': 'adryd',
    '142.112.151.178': 'adryd',
    '99.234.33.121': 'example'
};

const userData = {
    adryd: {
        // These config options are the same as in config.js, but they overwrite the defaults for their user
        blockBannerCapes: true,
        blockClassicCapes: false,
        blockOFCustomCapes: true,
        blockPlayerModels: true,
        blockRemoteConfig: true,
        blockUnhandledRequests: true,
        allowCustomPlayerModels: true,
        
        // in this case, "adryd" has a custom data folder where she can put data that doesnt affect others
        dataFolder: 'customDataFolderName', // custom data folder if user wants seperate capes not visible to others
        
        // "adryd" only wants to see capes from the following users.
        // The whitelist is only enabled if the "whitelist" array contains users
        whitelist: ['NotNite', 'heatingdevice'],
    },
    example: {
        blockBannerCapes: false,
        blockClassicCapes: false,
        blockOFCustomCapes: true,
        blockPlayerModels: true,
        blockRemoteConfig: true,
    },
};

module.exports = {
    users: userData,
    ipAddresses,
};
```

#### Data folder

Some example data can be found [here](https://github.com/adryd325/optifineProxyData)

capes:  
/capes/:user.png

user configs:  
/users/:user.cfg

models:  
/items/:model/model.cfg

model textures:  
/items/:model/users/:user.png
