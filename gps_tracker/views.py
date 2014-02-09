from pyramid.view import view_config

points_list = [
    {"_id": 'ObjectId("52e3eb56a7cade5d0898e012")', "latitude": "45.215",
     "longitude": "14.131", "gas_station": "Lukoil", "odometer": "24100",
     "description": "Bad coffee"},
    {"_id": 'ObjectId("52e3eb79a7cade5d0898e013")', "latitude": "47.412",
     "longitude": "16.112", "gas_station": "Shell", "odometer": "24300",
     "description": "Nice service, but fuel is more expensive"},
    {"_id": 'ObjectId("52e3eba5a7cade5d0898e014")', "latitude": "48.544",
     "longitude": "17.001", "gas_station": "Руснефть", "odometer": "24500",
     "description": "На заправке есть гостиница и кафе. Очень хорошо"},
    {"_id": 'ObjectId("52e3ec19a7cade5d0898e015")', "latitude": "49.165",
     "longitude": "18.125", "gas_station": "Татнефть", "odometer": "24750",
     "description": "Есть стоянка кемпинг-стоянка. Дешёвая незамерзайка."},
    {"_id": 'ObjectId("52f3aaf0a7cade0d846d00d7")', "gas_station": "Газпром",
     "odometer": "28400", "latitude": "49.249",
     "description": "Хорошее кафе, есть душ!", "longitude": "19.100"}
]


@view_config(route_name='points', request_method='GET', renderer='json')
def points_get_all(request):
    return points_list


@view_config(route_name='points', request_method='POST', renderer='json')
def point_add_new(request):
    return points_list[2]


@view_config(route_name='point', request_method='GET', renderer='json')
def point_get_one(request):
    return points_list[0]


@view_config(route_name='point', request_method='PATCH', renderer='json')
def point_edit_one(request):
    return {'response': 'point edited'}


@view_config(route_name='point', request_method='DELETE', renderer='json')
def point_delete_one(request):
    return {}
