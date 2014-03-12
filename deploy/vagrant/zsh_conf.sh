#!/bin/bash -x

set -e

# prepare
aptitude -y install git zsh

# for root
curl --silent https://raw.github.com/zzzsochi/zsh_config/master/install.sh | zsh
usermod -s /usr/bin/zsh root

# for vagrant
curl --silent https://raw.github.com/zzzsochi/zsh_config/master/install.sh | sudo -u vagrant -i zsh
usermod -s /usr/bin/zsh vagrant
