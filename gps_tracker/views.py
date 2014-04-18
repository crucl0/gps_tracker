from pyramid.view import view_config
from bson.objectid import ObjectId
from bson.errors import InvalidId

from pyramid.httpexceptions import (HTTPNotFound,
                                    HTTPBadRequest)


class RESTView(object):
    def __init__(self, request):
        self.request = request
        self.resource = self.request.path_info_peek()

    def get_all(self):
        return getattr(self.request.mongo_db, self.resource).find()

    def get_one(self):
        try:
            _id = ObjectId(self.request.matchdict["id"])
            return getattr(self.request.mongo_db, self.resource).find_one(_id)
        except InvalidId:
            return HTTPNotFound("There is no such object")

    def add_new(self):
        item_new = {key: self.request.json_body[key] for key in self.request.json_body}
        item_new_id = getattr(self.request.mongo_db, self.resource).insert(item_new)
        return getattr(self.request.mongo_db, self.resource).find_one(item_new_id)

    def update_one(self):
        try:
            _id = ObjectId(self.request.matchdict["id"])
            getattr(self.request.mongo_db, self.resource).find_one(_id)
        except InvalidId:
            return HTTPNotFound("There is no such object")
        if not isinstance(self.request.json_body, dict):
            return HTTPBadRequest("The body of PUT request must be JSON")
        elif not self.request.json_body:
                return HTTPBadRequest("The body of PUT request is empty. Nothing to do.")
        else:
            _id = ObjectId(self.request.matchdict["id"])
            replacement = self.request.json_body.copy()
            replacement["_id"] = _id
            getattr(self.request.mongo_db, self.resource).save(replacement)
            return getattr(self.request.mongo_db, self.resource).find_one(_id)

    def edit_one(self):
        try:
            _id = ObjectId(self.request.matchdict["id"])
            getattr(self.request.mongo_db, self.resource).find_one(_id)
        except InvalidId:
            return HTTPNotFound("There is no such object.")
        if not isinstance(self.request.json_body, dict):
            return HTTPBadRequest("The body of PATCH request must be JSON.")
        elif not self.request.json_body:
            return HTTPBadRequest("The Body of PATCH request is empty. Nothing to do.")
        else:
            _id = ObjectId(self.request.matchdict["id"])
            getattr(self.request.mongo_db, self.resource).update({"_id": _id},
                                            {"$set": self.request.json_body})
            return getattr(self.request.mongo_db, self.resource).find_one(_id)

    def delete_one(self):
        try:
            _id = ObjectId(self.request.matchdict["id"])
            getattr(self.request.mongo_db, self.resource).remove({"_id": _id})
            return {}
        except InvalidId:
            return HTTPNotFound("There is no such object")
