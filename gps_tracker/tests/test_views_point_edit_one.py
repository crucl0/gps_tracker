from .baseconfig import BaseConfig
from pyramid.httpexceptions import (HTTPNotFound,
                                    HTTPBadRequest)


class TestViewsPointEditOne(BaseConfig):
    """ Try to edit one point
    """
    def test_invalid_id(self):
        """ This point doesn't exist, does it?
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b53'}

        inst = self._make_one(request)
        point = inst.edit_one()
        self.assertIsInstance(point, HTTPNotFound)

    def test_valid_id(self):
        """ This point exists, doesn't it?
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537f9'}

        inst = self._make_one(request)
        point = inst.get_one()
        self.assertEqual(point['gas_station'], 'Lukoil')

    def test_empty_request_body(self):
        """ Try with empty body of request
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537f9'}
        request.json_body = {}

        inst = self._make_one(request)
        point = inst.edit_one()
        self.assertIsInstance(point, HTTPBadRequest)

    def test_wrong_type(self):
        """ Try with wrong type of body of request
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537f9'}
        request.json_body = 5

        inst = self._make_one(request)
        point = inst.edit_one()
        self.assertIsInstance(point, HTTPBadRequest)

    def test_correct_edition(self):
        """ Try how it realy works.
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537f9'}
        request.json_body = {'gas_station': 'MyOwnStation'}

        inst = self._make_one(request)
        point = inst.edit_one()
        self.assertNotEqual(point['gas_station'], 'Lukoil')
        self.assertEqual(point['gas_station'], 'MyOwnStation')
