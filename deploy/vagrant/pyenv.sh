#!/bin/bash -x

set -e

# venv and python environment
install_python_environment () {
    set -e

    # for install mixer
    export LC_ALL=`locale --all | grep -i ru_RU.utf`

    pyvenv-3.3 --clear "$HOME/venv"

    echo 'source $HOME/venv/bin/activate' >> "$HOME/.profile"
    source "$HOME/venv/bin/activate"

    echo 'PATH="$HOME/venv/local/bin:$PATH"' >> "$HOME/.profile"
    PATH="$HOME/venv/local/bin:$PATH"

    curl --silent "https://bitbucket.org/pypa/setuptools/raw/bootstrap/ez_setup.py" | python
    curl --silent "https://raw.github.com/pypa/pip/master/contrib/get-pip.py" | python

    cd /vagrant
    find . -name "__pycache__" | xargs rm -rf
    python3.3 setup.py develop
}

sudo -u vagrant -i zsh -c "`declare -f install_python_environment`; install_python_environment"
