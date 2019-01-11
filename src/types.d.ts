export interface Point {
  lat: number;
  lng: number;
}

export interface ParkingSpace {
  coordinates: Point;
  bay_id: string;
}