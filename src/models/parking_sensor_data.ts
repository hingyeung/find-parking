class ParkingSensorData {
  constructor(
    bay_id: string,
    st_marker_id: string,
    lon: number,
    lat: number,
    status: string
  ) {
    this.bay_id = bay_id;
    this.st_marker_id = st_marker_id;
    this.lon = lon;
    this.lat = lat;
    this.status = status;
  }

  bay_id: string;
  st_marker_id: string;
  lon: number;
  lat: number;
  status: string;
}