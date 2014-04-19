from .baseconfig import BaseConfig

from pyramid.httpexceptions import (HTTPNotFound,
                                    HTTPBadRequest)


class TestViewsPointUpdateOne(BaseConfig):
    """ Try to update one point
    """
    def test_invalid_id(self):
        """ This point doesn't exist, does it?
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b53'}

        inst = self._make_one(request)
        point = inst.update_one()
        self.assertIsInstance(point, HTTPNotFound)

    def test_valid_id(self):
        """ This point exists, doesn't it?
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}

        inst = self._make_one(request)
        point = inst.get_one()
        self.assertEqual(point['gas_station'], 'Руснефть')
        self.assertEqual(len(point), 6)

    def test_empty_request_body(self):
        """ Try with empty body of request
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}
        request.json_body = {}

        inst = self._make_one(request)
        point = inst.update_one()
        self.assertIsInstance(point, HTTPBadRequest)

    def test_wrong_type(self):
        """ Try with wrong type of body of request
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}
        request.json_body = 6

        inst = self._make_one(request)
        point = inst.update_one()
        self.assertIsInstance(point, HTTPBadRequest)

    def test_correct_update(self):
        """ Try how it realy works.
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}
        request.json_body = {'gas_station': 'MyOwnStation'}

        inst = self._make_one(request)
        point = inst.update_one()
        self.assertEqual(point['gas_station'], 'MyOwnStation')
        self.assertEqual(len(point), 2)
