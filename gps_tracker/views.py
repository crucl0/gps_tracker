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

    def put(self):
        pass

    def patch(self):
        pass

    def delete(self):
        pass



# @view_config(route_name='points', request_method='GET', renderer='json')
# def points_get_all(request):
#     return list(request.mongo_db.points.find())


# @view_config(route_name='points', request_method='POST', renderer='json')
# def point_add_new(request):
#     point = {key: request.json_body[key] for key in request.json_body}
#     point_new_id = request.mongo_db.points.insert(point)
#     return request.mongo_db.points.find_one(point_new_id)


# @view_config(route_name='point', request_method='GET', renderer='json')
# def point_get_one(request):
#     try:
#         _id = ObjectId(request.matchdict["id"])
#         point = request.mongo_db.points.find_one(_id)
#         return point
#     except InvalidId:
#         return HTTPNotFound("There is no such object")


# @view_config(route_name='point', request_method='PATCH', renderer='json')
# def point_edit_one(request):
#     try:
#         _id = ObjectId(request.matchdict["id"])
#         request.mongo_db.points.find_one(_id)
#     except InvalidId:
#         return HTTPNotFound("There is no such object.")
#     if not isinstance(request.json_body, dict):
#         return HTTPBadRequest("The body of PATCH request must be JSON.")
#     elif not request.json_body:
#         return HTTPBadRequest("The Body of PATCH request is empty. Nothing to do.")
#     else:
#         _id = ObjectId(request.matchdict["id"])
#         request.mongo_db.points.update({"_id": _id},
#                                        {"$set": request.json_body})
#         return request.mongo_db.points.find_one(_id)


# @view_config(route_name='point', request_method='PUT', renderer='json')
# def point_update_one(request):
#     try:
#         _id = ObjectId(request.matchdict["id"])
#         request.mongo_db.points.find_one(_id)
#     except InvalidId:
#         return HTTPNotFound("There is no such object")
#     if not isinstance(request.json_body, dict):
#         return HTTPBadRequest("The body of PUT request must be JSON")
#     elif not request.json_body:
#             return HTTPBadRequest("The body of PUT request is empty. Nothing to do.")
#     else:
#         _id = ObjectId(request.matchdict["id"])
#         replacement = request.json_body.copy()
#         replacement["_id"] = _id
#         request.mongo_db.points.save(replacement)
#         return request.mongo_db.points.find_one(_id)


# @view_config(route_name='point', request_method='DELETE', renderer='json')
# def point_delete_one(request):
#     try:
#         _id = ObjectId(request.matchdict["id"])
#         request.mongo_db.points.remove({"_id": _id})
#         return {}
#     except InvalidId:
#         return HTTPNotFound("There is no such object")
