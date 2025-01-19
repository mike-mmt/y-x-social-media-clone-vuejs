# 'Y' social media app

To start the app, place ssl certificate named `y.crt` and `y.key` in `ssl` directory and run the following command in the root directory:
`docker-compose up`. The app will be available at `https://localhost`.

Command to start OrientDB:
`docker run -d --name orientdb-2 -p 2424:2424 -p 2480:2480 -v "C:\DockerVolumes\orientdb":/orientdb/databases -e ORIENTDB_ROOT_PASSWORD=rootpwd orientdb`
