from pyramid.view import view_config
from bson.objectid import ObjectId
from bson.errors import InvalidId

from pyramid.httpexceptions import (HTTPNotFound,
                                    HTTPBadRequest)


@view_config(route_name='index', renderer='gps_tracker:templates/index.pt')
def index_view(request):
    return {}


@view_config(route_name='points', request_method='GET', renderer='json')
def points_get_all(request):
    points = [point for point in request.mongo_db.points.find()]
    return points


@view_config(route_name='points', request_method='POST', renderer='json')
def point_add_new(request):
    point = {key: request.json_body[key] for key in request.json_body}
    point_new_id = request.mongo_db.points.insert(point)
    return request.mongo_db.points.find_one(
        {"_id": ObjectId(point_new_id)})


@view_config(route_name='point', request_method='GET', renderer='json')
def point_get_one(request):
    try:
        _id = ObjectId(request.matchdict["id"])
        point = request.mongo_db.points.find_one({"_id": _id})
        return point
    except InvalidId:
        return HTTPNotFound("There is no such resource")


@view_config(route_name='point', request_method='PATCH', renderer='json')
def point_edit_one(request):
    try:
        try:
            _id = ObjectId(request.matchdict["id"])
            request.mongo_db.points.find_one(_id)
        except InvalidId:
            return HTTPNotFound("There is no such resource")

        if len(request.json_body) == 0:
            return HTTPBadRequest("PATCH request body if empty. Nothing to do")
        else:
            _id = ObjectId(request.matchdict["id"])
            updates = request.json_body
            request.mongo_db.points.update({"_id": _id},
                                           {"$set": updates})
            return request.mongo_db.points.find_one(_id)
    except TypeError:
        return HTTPBadRequest("Request body must be JSON. Check your request")


@view_config(route_name='point', request_method='PUT', renderer='json')
def point_update_one(request):
    try:
        try:
            _id = ObjectId(request.matchdict["id"])
            request.mongo_db.points.find_one(_id)
        except InvalidId:
            return HTTPNotFound("There is no such resource")

        if len(request.json_body) == 0:
            return HTTPBadRequest("PUT request body is empty. Nothing to do.")
        else:
            _id = ObjectId(request.matchdict["id"])
            replacement = request.json_body
            replacement["_id"] = _id
            request.mongo_db.points.save(replacement)
            return request.mongo_db.points.find_one(_id)
    except TypeError:
        return HTTPBadRequest("PUT request body must be JSON")


@view_config(route_name='point', request_method='DELETE', renderer='json')
def point_delete_one(request):
    try:
        _id = ObjectId(request.matchdict["id"])
        request.mongo_db.points.remove({"_id": _id})
        return {}
    except InvalidId:
        return HTTPNotFound("There is no such resource")
