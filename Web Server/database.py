import kiss
import socket
import ax25
import mysql.connector
from datetime import datetime

def onReceive(kiss_port, data):
    frame = ax25.Frame.unpack(data)

    print(frame)

    if str(frame.src) != "VE3GFJ-9":
        return

    message: str = frame.data.decode('utf-8', 'replace')

    raw_latitude = message[1:8]
    latitude_degrees = float(raw_latitude[0:2])
    latitude_minutes = float(raw_latitude[2:])
    latitude = latitude_degrees + (latitude_minutes / 60.0)

    if message[8] == "S":
        latitude = -latitude

    raw_longitude = message[11:18]
    longitude_degrees = float(raw_longitude[0:2])
    longitude_minutes = float(raw_longitude[2:])
    longitude = longitude_degrees + (longitude_minutes / 60.0)

    if message[18] == "W":
        longitude = - longitude

    altitude = float(message[23:29])
    climb = float(message[35:message.find("m/s")])
    temperature = float(message[message.find("T:")+2:message.find("C H")])
    humidity = float(message[message.find("H:")+2:message.find("%")])
    pressure = float(message[message.find("P:")+2:message.find("hPa")])
    satellites = int(message[message.find("Sats:")+5:len(message)])

    print("Latitude: " + str(latitude))
    print("Longitude: " + str(longitude))
    print("Altitude: " + str(altitude))
    print("Climb rate: " + str(climb))
    print("Temperature: " + str(temperature))
    print("Humidity: " + str(humidity))
    print("Pressure: " + str(pressure))
    print("Satellites: " + str(satellites))

    now = datetime.now()
    sql = "INSERT INTO aprs_telemetry (reading_time, callsign, latitude, longitude, altitude, climb, temperature, humidity, pressure, satellites, raw_packet) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    val = (now, str(frame.src), latitude, longitude, altitude, climb, temperature, humidity, pressure, satellites, message)

    with mysql.connector.connect(**config) as conn:
        with conn.cursor() as cursor:
            cursor.execute(sql, val)

        conn.commit()

direwolf_connection = kiss.Connection(onReceive)

error = None

try:
    direwolf_connection.connect_to_server("localhost", 8001)
except socket.gaierror as e:
        if e.errno == socket.EAI_NONAME:
            error = 'Server name not found'
        else:
            error = 'Invalid server address'
except ConnectionRefusedError:
    error = 'Connection refused by server'
except Exception:
    error = 'Unknown error connecting to server'

if error:
    print(error)
    quit(-1 )

print("Successfully connected to Direwolf")

config = {
    'user': 'balloon',
    'password': 'ball00n$',
    'host': '127.0.0.1',
    'database': 'balloonTesting'
}

with mysql.connector.connect(**config) as conn:
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM aprs_telemetry")
        for row in cursor.fetchall():
            print(row)