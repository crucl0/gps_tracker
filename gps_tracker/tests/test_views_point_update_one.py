from .test_base import TestBase

from pyramid.httpexceptions import (HTTPNotFound,
                                    HTTPBadRequest)

from gps_tracker.views import (point_update_one,
                               point_get_one)


class TestViewsPointUpdateOne(TestBase):
    """ Try to update one point
    """
    def test_invalid_id(self):
        """ This point doesn't exist, does it?
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b53'}

        point = point_update_one(request)
        self.assertIsInstance(point, HTTPNotFound)

    def test_valid_id(self):
        """ This point does exist, doesn't it?
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}

        point = point_get_one(request)
        self.assertEqual(point['gas_station'], 'Руснефть')
        self.assertEqual(len(point), 6)

    def test_empty_request_body(self):
        """ Try with empty body of request
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}
        request.json_body = {}

        point = point_update_one(request)
        self.assertIsInstance(point, HTTPBadRequest)

    def test_wrong_type(self):
        """ Try with wrong type of body of request
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}
        request.json_body = 6

        point = point_update_one(request)
        self.assertIsInstance(point, HTTPBadRequest)

    def test_correct_update(self):
        """ Try how it realy works.
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}
        request.json_body = {'gas_station': 'MyOwnStation'}

        point = point_update_one(request)
        self.assertEqual(point['gas_station'], 'MyOwnStation')
        self.assertEqual(len(point), 2)
