from .baseconfig import BaseConfig
from bson.errors import InvalidId


class TestViewsPointGetOne(BaseConfig):
    """ Try to get one point
    """
    def test_invalid_id(self):
        """This point doesn't exist, does it?
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b53'}

        inst = self._make_one(request)
        inst.get_one()
        self.assertRaises(InvalidId)

    def test_valid_id(self):
        """This point exists, doesn't it?
        """
        request = self.own_request()
        request.matchdict = {'id': '5309deeca7cade7139b537fa'}

        inst = self._make_one(request)
        point = inst.get_one()
        self.assertIsInstance(point, dict)
        self.assertEqual(point['gas_station'], 'Shell')

    def test_valid_but_wrong_id(self):
        """ Something is wrong with this point, eh?
        """
        request = self.own_request()
        request.matchdict = {'id': '531ba74fa7cade60aa44ae8d'}

        inst = self._make_one(request)
        inst.get_one()
        self.assertRaises(InvalidId)
