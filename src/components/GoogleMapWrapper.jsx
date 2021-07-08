import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getAirports, getBrighterColor, getRoutes, getSectors } from '../selectors';
import GoogleMap from './GoogleMap';

class GoogleMapWrapper extends Component {
  constructor() {
    super();
    this.handleMapMounted = this.handleMapMounted.bind(this);
  }

  shouldComponentUpdate({ routes }) {
    return routes !== null;
  }
  componentDidUpdate(prevProps) {
    const { routeString, prevPathname, map } = this.props;
    if (map && routeString.length !== 0) {
      if (
        routeString !== prevProps.routeString ||
        (prevPathname !== '/' && prevPathname !== '/roadmap')
      ) {
        this.fitBounds();
      }
    }
  }

  fitBounds() {
    // Change the viewport to fit the airports that have been rendered to the map.
    const { routes, map } = this.props;
    const { LatLngBounds, LatLng } = google.maps;
    const newBounds = new LatLngBounds();
    routes.forEach(route => {
      route.forEach(airport => {
        newBounds.extend(new LatLng(airport.lat, airport.lng));
      });
    });
    map.fitBounds(newBounds);
  }

  handleMapMounted(map) {
    const { dispatch } = this.props;
    if (map) {
      dispatch({ type: 'MOUNT_MAP', map });
    }
  }

  render() {
    const {
      routes,
      airports,
      sectors,
      mapType,
      label,
      routeColor,
      pointColor,
      map,
      country
    } = this.props;
    const rootUrl = country === 'cn' ? 'http://maps.google.cn' : 'https://maps.googleapis.com';
    return (
      <GoogleMap
        googleMapURL={`${rootUrl}/maps/api/js?v=3.exp&key=AIzaSyBISa-Ul-NOnD-H5lweC_w4evLmV_0fuSU`}
        loadingElement={<div style={{ height: '100%' }} />}
        containerElement={<div id="map-container" />}
        mapElement={<div id="map" />}
        map={map}
        routes={routes}
        airports={airports}
        sectors={sectors}
        onMapMounted={this.handleMapMounted}
        mapType={mapType}
        label={label}
        routeColor={routeColor}
        pointColor={pointColor}
      />
    );
  }
}
GoogleMapWrapper.propTypes = {
  country: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  routes: PropTypes.arrayOf(PropTypes.array),
  sectors: PropTypes.arrayOf(PropTypes.array).isRequired,
  airports: PropTypes.arrayOf(PropTypes.object).isRequired,
  routeString: PropTypes.string.isRequired,
  prevPathname: PropTypes.string.isRequired,
  map: PropTypes.shape({ fitBounds: PropTypes.func }),
  mapType: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  routeColor: PropTypes.string.isRequired,
  pointColor: PropTypes.string.isRequired
};
GoogleMapWrapper.defaultProps = { map: null, routes: null };

function mapStateToProps(state) {
  return {
    country: state.country,
    routes: getRoutes(state).routes,
    sectors: getSectors(state),
    airports: getAirports(state),
    routeString: state.router.query.routes || '',
    prevPathname: state.router.previous ? state.router.previous.pathname : '',
    mapType: state.router.result.mapType,
    label: state.router.query.label || 'city',
    map: state.map,
    routeColor: state.router.query.color || '#d03030',
    pointColor: getBrighterColor(state)
  };
}

export default connect(mapStateToProps)(GoogleMapWrapper);
