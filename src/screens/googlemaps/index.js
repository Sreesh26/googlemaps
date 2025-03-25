import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import MapView, {Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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
   });

export default function GoogleMapsScreen() {
  return (
    <View style={styles.container}>
    <MapView
      provider={PROVIDER_GOOGLE} // remove if not using Google Maps
      style={styles.map}
      region={{
        latitude: 33.195682,
        longitude: -97.126790,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      <Marker
      key={index}
      coordinate={{latitude: 33.195682, longitude: -97.126790}}
      title={'Current Location'}
      description={marker.description}
    />
    </MapView>
  </View>
  )
}