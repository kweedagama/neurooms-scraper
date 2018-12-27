function formatRooms(data) {
  let formattedRooms = [];
  for (var i = 0; i < data.length; i++) {
    let building = data[i].building;
    for (var j = 0; j < data[i].rooms.length; j++) {
      let current = data[i].rooms[j];
      let room = {
        capacity: current.capacity,
        furnitureStyle: current.furnitureStyle,
        technology: current.technology,
        roomType: current.type,
        name: current.room,
        images: current.images,
        linkTo: current.linkTo,
        building: building
      };
      formattedRooms.push(room);
    }
  }
  return formattedRooms;
}

module.exports = { formatRooms };
