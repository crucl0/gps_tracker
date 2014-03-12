#!/bin/bash

echo "\"Run \'cd planio && py.test '$1'\""

vagrant ssh -c "cd planio && py.test '$1'"
# vagrant ssh -c "cd planio && python setup.py test '$1'"
