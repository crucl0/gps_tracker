# -*- mode: ruby -*-
# vi: set ft=ruby :

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu-12.04_amd64"
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"

  config.vm.network :forwarded_port, guest: 6543, host: 6543

  config.vm.synced_folder ".", "/home/vagrant/gps_tracker"

  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--cpus", "2"]
    vb.customize ["modifyvm", :id, "--memory", "2048"]
  end

  config.vm.provision :shell, :path => "deploy/vagrant/basic.sh"
  config.vm.provision :shell, :path => "deploy/vagrant/apt_basic.sh"
  config.vm.provision :shell, :path => "deploy/vagrant/apt_site.sh"
  config.vm.provision :shell, :path => "deploy/vagrant/pyenv.sh"
end
