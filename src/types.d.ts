export interface Point {
  lat: number;
  lng: number;
}

export interface ParkingSpace {
  coordinate: Point;
  bay_id: string;
}