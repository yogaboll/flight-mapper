import { combineReducers } from "redux"
import routes from "./routes"
import airportData from "./airportData"
import error from "./error"
import map from "./map"
import inputMode from "./inputMode"
import settings from "./settings"
import mobile from "./mobile"
import url from "./url"
// import location from "./location"

export default combineReducers(
  { routes, airportData, error, map, inputMode, settings, mobile, url }
)
