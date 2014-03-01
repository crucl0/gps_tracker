from .test_base import TestBase

from pyramid.httpexceptions import (HTTPNotFound,
                                    HTTPBadRequest)

from gps_tracker.views import (point_edit_one,
                               point_get_one)


class TestViewsPointEditOne(TestBase):
    """ Try to edit one point
    """
    def test_invalid_id(self):
        """ This point doesn't exist, does it?
        """
        request = self.test_request()

        request.matchdict = {'id': '5309deeca7cade7139b53'}
        point = point_edit_one(request)
        self.assertIsInstance(point, HTTPNotFound)

    def test_valid_id(self):
        """ This poin does exist, doesn't it?
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b537f9'}

        point = point_get_one(request)
        self.assertEqual(point['gas_station'], 'Lukoil')

    def test_empty_request_body(self):
        """ Try with empty body of request
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b537f9'}
        request.json_body = {}

        point = point_edit_one(request)
        self.assertIsInstance(point, HTTPBadRequest)

    def test_wrong_type(self):
        """ Try with wrong type of body of request
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b537f9'}
        request.json_body = 5

        point = point_edit_one(request)
        self.assertIsInstance(point, HTTPBadRequest)

    def test_correct_edition(self):
        """ Try how it realy works.
        """
        request = self.test_request()
        request.matchdict = {'id': '5309deeca7cade7139b537f9'}
        request.json_body = {'gas_station': 'MyOwnStation'}

        point = point_edit_one(request)
        self.assertNotEqual(point['gas_station'], 'Lukoil')
        self.assertEqual(point['gas_station'], 'MyOwnStation')
