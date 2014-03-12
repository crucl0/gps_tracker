#!/bin/bash -x

set -e

# prepare
aptitude -y install python-software-properties

# mongodb-10gen
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' > /etc/apt/sources.list.d/mongodb-10gen.list

# python 3.3
add-apt-repository -y ppa:fkrull/deadsnakes

# installing extended packages
aptitude update
aptitude -y install mongodb-10gen python3.3 python3.3-dev 
