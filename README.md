GPS Tracker
===========

Deploying for develop
---------------------

Install [Vagrant][vagrant] and [VirtualBox][virtualbox].

    git clone git@github.com:crucl0/gps_tracker.git
    cd gps_tracker/
    vagrant plugin install vagrant-vbguest
    vagrant up

[vagrant]: http://www.vagrantup.com/downloads.html "Download Vagrant"
[virtualbox]: https://www.virtualbox.org/wiki/Downloads "Download VirtualBox"


Developing process
------------------

### Start project

    ./deploy/vagrant/start.sh

You can see result in browser: [http://localhost:6543][local_pserv].

[local_pserv]: http://localhost:6543 "pserve default port is forwarding to localhost"

### Access to machine

    vagrant ssh

Source code found in `/vagrant`. It authomated synced with you sources.


### Other

See the [vagrant documentation][vagrant_doc]. Also, you can run `vagrant help`...

[vagrant_doc]: http://docs.vagrantup.com/v2/ "Vagrant documentation overview"
