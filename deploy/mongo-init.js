db.createUser(
  {
    user: "findparking-app",
    pwd: "password",
    roles: [
      {
        role: "readWrite",
        db: "findparkingdb"
      }
    ]
  }
);
