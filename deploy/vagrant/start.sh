#!/bin/bash

echo "Starting server within a virtual environment..."

vagrant ssh -c "pserve --reload /vagrant/settings/development.ini"
