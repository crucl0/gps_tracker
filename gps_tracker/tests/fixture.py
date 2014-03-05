from bson.objectid import ObjectId

fixture_points = [
    {"latitude": "45.215", "longitude": "14.131", "gas_station": "Lukoil",
     "odometer": "24100", "description": "Bad coffee",
     "_id": ObjectId("5309deeca7cade7139b537f9")},
    {"latitude": "47.412", "longitude": "16.112", "gas_station": "Shell",
     "odometer": "24300", "_id": ObjectId("5309deeca7cade7139b537fa"),
     "description": "Nice service, but fuel is more expensive"},
    {"latitude": "48.544", "longitude": "17.001", "gas_station": "Руснефть",
     "odometer": "24500", "_id": ObjectId("5309deeca7cade7139b537fb"),
     "description": "На заправке есть гостиница и кафе. Очень хорошо"},
    {"latitude": "49.165", "longitude": "18.125", "gas_station": "Татнефть",
     "odometer": "24750", "_id": ObjectId("5309deeca7cade7139b537fc"),
     "description": "Есть стоянка кемпинг-стоянка. Дешёвая незамерзайка."},
    {"gas_station": "Газпром", "odometer": "28400", "latitude": "49.249",
     "description": "Хорошее кафе, есть душ!", "longitude": "19.100",
     "_id": ObjectId("5309deeca7cade7139b537fd")},
    {"_id": ObjectId("5309deeca7cade7139b537fe"), "gas_station": "TurkOil"}]
