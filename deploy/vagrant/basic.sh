#!/bin/bash -x

set -e

export LC_ALL="C"

# update
aptitude update
# aptitude -y upgrade
DEBIAN_FRONTEND=noninteractive apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dist-upgrade

# install russian
aptitude -y install language-pack-ru-base
# export LC_ALL=`locale --all | grep -i ru_RU.utf`
update-locale "LC_ALL=`locale --all | grep -i ru_RU.utf`"
