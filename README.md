# optifineProxy
Self-MITM requests to optifine's cape server!

### Installation
the basic shell stuff
```sh
git clone https://github.com/adryd325/optifineProxy
cd ./optifineProxy
npm install
# Set configs in config.js and users.js
npm run
```
optifineProxy must run behind nginx or another reverse-proxy which provides the 'x-real-ip' header,
here's an example nginx config
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
then, one must set their hosts file (or use another method to change DNS) to point s.optifine.net to the server which runs optifineProxy
```
##
# Host Database
#
# localhost is used to configure the loopback interface
# when the system is booting.  Do not change this entry.
##
127.0.0.1	    localhost
255.255.255.255	broadcasthost
::1             localhost
127.0.0.1       s.optifine.net
```
