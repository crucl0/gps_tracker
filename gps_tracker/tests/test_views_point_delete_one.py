from .baseconfig import BaseConfig
from pyramid.httpexceptions import HTTPNotFound


class TestViewsPointDeleteOne(BaseConfig):
    """ Try to delete one point
    """
    def test_invalid_id(self):
        """ This point doesn't exist, does it?
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b5'}

        inst = self._make_one(request)
        point = inst.delete_one()
        self.assertIsInstance(point, HTTPNotFound)

    def test_valid_id(self):
        """ Try how it realy works
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fb'}

        inst = self._make_one(request)
        point = inst.get_one()
        self.assertNotEqual(len(point), 0)

        point = inst.delete_one()
        self.assertEqual(point, {})

        point = inst.get_one()
        self.assertEqual(point, None)
