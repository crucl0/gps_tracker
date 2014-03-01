from .baseconfig import BaseConfig
from gps_tracker.db import mongo_db_connection


class DataBaseTests(BaseConfig):
    """ Try to connect to mongo_db
    """
    def test_db_connection(self):
        request = self.own_request()
        db = mongo_db_connection(request)

        collection = db.test_collection
        test = {"a": 1, "b": 2, "c": 3}
        collection.save(test)
        read_back = collection.find_one()

        self.assertIsInstance(read_back, dict)
        self.assertIn("b", read_back)
