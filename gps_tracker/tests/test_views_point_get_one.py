from .baseconfig import BaseConfig
from bson.errors import InvalidId

from gps_tracker.views import point_get_one


class TestViewsPointGetOne(BaseConfig):
    """ Try to get one point
    """
    def test_invalid_id(self):
        """This point doesn't exist, does it?
        """
        request = self.own_request()

        request.matchdict = {'id': '5309deeca7cade7139b53'}
        point_get_one(request)
        self.assertRaises(InvalidId)

    def test_valid_id(self):
        """This point exists, doesn't it?
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fa'}
        point = point_get_one(request)
        self.assertIsInstance(point, dict)
        self.assertEqual(point['gas_station'], 'Shell')
