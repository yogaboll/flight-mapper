import React, { Component } from "react"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { LatLonEllipsoidal } from "geodesy"
import { Collapse } from "react-collapse"
import uniqueId from "lodash.uniqueid"
import MdClose from "react-icons/lib/md/close"

import { parseStringWithSlashes } from "../../actionCreators/getRoutesFromUrl"
import SectorElement from "./SectorElement"
import CollapsibleElement from "./CollapsibleElement"

class RouteElement extends Component {
  constructor() {
    super()
    this.state = { isOpened: false }

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleDeleteRoute = this.handleDeleteRoute.bind(this)
  }


  toggleCollapsible() {
    this.setState({ isOpened: !this.state.isOpened })
  }

  makeDistanceReadable(distance) {
    const { distanceUnit } = this.props
    switch (distanceUnit) {
      case "km":
        return `${Math.round(distance / 1000)} km`
      case "mi":
        return `${Math.round(distance / 1609.344)} mi`
      case "nm":
        return `${Math.round(distance / 1852)} nm`
      default:
        return null
    }
  }

  // take the urlparam, take away the route that was deleted and
  // push new urlparam to url
  handleDeleteRoute() {
    const { error, index, urlParam, history, dispatch } = this.props
    if (!error) {
      // Remove dangling comma, semi-colon or slash
      const routeStrNoDangle = urlParam.replace(/[,;/\n]$/, "")

      // Split urlparam by commas into an array
      const routeArr = routeStrNoDangle.split(/[,;\n]+/g)
      // Separate routes slashes so they create new routes
      const routeArrWithParsedSlashes = routeArr.reduce((acc, val) => {
        if ((/\//).test(val)) {
          return acc.concat(parseStringWithSlashes(val))
        }
        return acc.concat(val)
      }, [])

      routeArrWithParsedSlashes.splice(index, 1)
      const newRouteString = routeArrWithParsedSlashes.join()
      const newUrlParam = encodeURIComponent(newRouteString)

      dispatch({ type: "DISABLE_MAP_REBOUND" })

      history.push(`/${newUrlParam}`)
    }
  }

  handleKeyDown(event) {
    if (event.keyCode === 13 || event.keyCode === 32) {
      this.setState({ isOpened: !this.state.isOpened })
    } else if (event.keyCode === 27) {
      this.setState({ isOpened: false })
    }
  }

  render() {
    const { route } = this.props
    const sectors = []
    for (let i = 1; i < route.length; i += 1) {
      sectors.push([route[i - 1], route[i]])
    }
    const distances = sectors.map((sector) => {
      const p1 = new LatLonEllipsoidal(sector[0].lat, sector[0].lng)
      const p2 = new LatLonEllipsoidal(sector[1].lat, sector[1].lng)
      return p1.distanceTo(p2) || 0
    })
    const readableSectorDistances = distances.map(distance => this.makeDistanceReadable(distance))

    const totalDistance = distances.reduce((acc, val) => acc + val)
    const readableTotalDistance = this.makeDistanceReadable(totalDistance)

    const p1 = new LatLonEllipsoidal(route[0].lat, route[0].lng)
    const p2 = new LatLonEllipsoidal(route[route.length - 1].lat, route[route.length - 1].lng)
    const nonStopDistance = p1.distanceTo(p2)
    const readableNonStopDistance = this.makeDistanceReadable(nonStopDistance)

    const distanceDifference = totalDistance - nonStopDistance
    const readableDistanceDifference = this.makeDistanceReadable(distanceDifference)

    const distanceDifferencePercentage = (distanceDifference * 100) / nonStopDistance
    const readableDifferencePercentage = `${distanceDifferencePercentage.toFixed(1)}%`

    const { label } = this.props

    return (
      <li className="route-element">
        <div className="sector-elements-wrapper">
          <div
            className="sector-elements"
            onClick={() => this.toggleCollapsible()}
            onKeyDown={this.handleKeyDown}
            role="button"
            tabIndex={0}
          >
            {sectors.map((sector, i) => (
              <SectorElement
                label={label}
                sector={sector}
                distance={readableSectorDistances[i]}
                key={uniqueId()}
              />
            ))}
            {sectors.length > 1 ? (
              <div className="big-font italic padding-4px">
                <span>Total:</span>
                <span className="float-right bold">
                  {readableTotalDistance}
                </span>
              </div>
            ) : null
            }
          </div>
          <button onClick={this.handleDeleteRoute} className="delete-button">
            <MdClose />
            {/* <i className="fa fa-times" aria-hidden /> */}
          </button>
        </div>
        <Collapse isOpened={this.state.isOpened}>
          <CollapsibleElement
            route={route}
            label={label}
            readableSectorDistances={readableSectorDistances}
            distances={distances}
            sectors={sectors}
            readableDistanceDifference={readableDistanceDifference}
            readableDifferencePercentage={readableDifferencePercentage}
            readableNonStopDistance={readableNonStopDistance}
          />
        </Collapse>
      </li>
    )
  }
}

RouteElement.propTypes = {
  route: PropTypes.arrayOf(PropTypes.object).isRequired,
  index: PropTypes.number.isRequired,
  distanceUnit: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  urlParam: PropTypes.string,
  history: PropTypes.shape({ push: PropTypes.function }).isRequired,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired,
  dispatch: PropTypes.func.isRequired
}
RouteElement.defaultProps = { urlParam: "" }

function mapStateToProps(state) {
  return {
    distanceUnit: state.settings.distanceUnit.abbr,
    label: state.settings.label.value,
    error: state.error,
    urlParam: state.url.param,
    history: state.url.history
  }
}

export default connect(mapStateToProps)(RouteElement)