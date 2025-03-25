import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '../../config/constant/api';

const id = uuidv4();

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  inputWrapper: {
    position: 'absolute',
    top: 40,
    zIndex: 999,
    width: '100%',
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  autocomplete: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default function GoogleMapsScreen() {
  const mapRef = useRef(null);
  const [origin, setOrigin] = useState();
  const [destination, setDestination] = useState();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    _getLocationPermission();
  }, []);

  async function _getLocationPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionsGranted(true);
          _getCurrentLocation();
        } else {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to show your current location on the map.'
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === 'ios') {
      console.log('iOS detected, attempting to get current location...');
      _getCurrentLocation(); 
    }
  }

  function _getCurrentLocation() {
    Geolocation.getCurrentPosition(
      (location) => {
        const { latitude, longitude } = location.coords;
        const coords = { latitude, longitude };
        setUserLocation(coords);
        moveToLocation(coords);
      },
      (error) => {
        console.warn('Error getting current location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }

  function moveToLocation({ latitude, longitude }) {
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
    }, 1000);
  }

  if (!permissionsGranted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please allow location permission to continue...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <View style={styles.autocomplete}>
          <GooglePlacesAutocomplete
            fetchDetails={true}
            placeholder="Source"
            onPress={(data, details = null) => {
              let originCoords = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              };
              setOrigin(originCoords);
              moveToLocation(originCoords);
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'en',
              components: 'country:us',
            }}
            predefinedPlaces={[]}
            textInputProps={{}}
            debounce={200}
            styles={{
              textInputContainer: { backgroundColor: 'white', borderRadius: 8 },
              textInput: { height: 40, color: '#5d5d5d', fontSize: 16 },
              listView: { backgroundColor: 'white' },
            }}
          />
        </View>
        <View style={styles.autocomplete}>
          <GooglePlacesAutocomplete
            fetchDetails={true}
            placeholder="Destination"
            onPress={(data, details = null) => {
              let destCoords = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              };
              setDestination(destCoords);
              moveToLocation(destCoords);
            }}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'en',
              components: 'country:us',
            }}
            predefinedPlaces={[]}
            textInputProps={{}}
            debounce={200}
            styles={{
              textInputContainer: { backgroundColor: 'white', borderRadius: 8 },
              textInput: { height: 40, color: '#5d5d5d', fontSize: 16 },
              listView: { backgroundColor: 'white' },
            }}
          />
        </View>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={
          userLocation
                ? {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.0121,
                  }
                : undefined 
            }
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
        <Marker
          draggable
          coordinate={userLocation || { latitude: 33.195682, longitude: -97.126790 }}
          title="Current Location"
          onDragEnd={(e) => console.log('New location:', e.nativeEvent.coordinate)}
        />
        {origin && <Marker coordinate={origin} title="Source" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
        {origin && destination && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="blue"
            onReady={(result) => {
              mapRef.current.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }}
            onError={(err) => console.error('Route error:', err)}
          />
        )}
      </MapView>
    </View>
  );
}
