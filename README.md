# optifineProxy
Self-MITM requests to optifine's cape server!

Please read LICENSE.md for what you can and cannot do with this software.  
I will not be providing direct support for this software, though you may open issues.  
I'm assuming sp614x wanted to keep some of these features to be special for themself or their friends, so preferabily don't host public instances, and don't abuse this.  
sp, if you're reading this and would like anything changed let me know.  

### Installation
the basic shell stuff
```sh
git clone https://github.com/adryd325/optifineProxy
cd ./optifineProxy
npm install
# Set configs in config.js and users.js
npm run
```
optifineProxy runs optimally behind nginx or another proxy that provides the X-Real-IP header, but will work without
without a proxy it must run on port 80
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
