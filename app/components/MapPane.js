import React, {Component, PropTypes} from 'react'
import { Panel } from 'react-bootstrap'
import { Map, Marker, Popup, TileLayer, CircleMarker, Polyline, GeoJson, FeatureGroup } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer'
import moment from 'moment'

import ProjectListing from './ProjectListing'
import routes from '../../routes.json'

export default class MapPane extends Component {

  constructor (props) {
    super(props)
  }
  componentDidMount () {
    // this.timer = setInterval(() => {
    //   this.setState({hour: (this.state.hour + 1) % 24})
    // }, 5000)
  }
  componentWillUnmount () {
    // clearInterval(this.timer)
  }
  getProjectLayer (project) {
    if(!project.geojson) return null
    const popup = (
      <Popup>
        <ProjectListing
          project={project}
          inverse={true}
          projectToggled={() => this.props.projectToggled(project)}
        />
      </Popup>
    )

    const color = project.selected ? '#df691a' : 'gray'
    switch(project.geojson.geometry.type) {
      case 'Point':
        return (
          <CircleMarker
            center={[project.geojson.geometry.coordinates[1], project.geojson.geometry.coordinates[0]]}
            color={color}
            radius={project.selected ? 10 : 8}
            weight={4}
            key={project.id}
          >
            {popup}
          </CircleMarker>
        )
      case 'LineString':
        const positions = project.geojson.geometry.coordinates.map(coord => {
          return [coord[1], coord[0]]
        })
        return (
          <Polyline
            positions={positions}
            color={color}
            weight={project.selected ? 10 : 8}
            key={project.id}
          >
            {popup}
          </Polyline>
        )
    }
  }

  getHighlightLayer (projectId) {
    const project = this.props.projects.all.find(p => p.id === projectId)
    const color = 'yellow'
    switch(project.geojson.geometry.type) {
      case 'Point':
        return (
          <CircleMarker
            center={[project.geojson.geometry.coordinates[1], project.geojson.geometry.coordinates[0]]}
            color={color}
            radius={16}
            stroke={false}
            key={project.id}
          />
        )
      case 'LineString':
        const positions = project.geojson.geometry.coordinates.map(coord => {
          return [coord[1], coord[0]]
        })
        return (
          <Polyline
            positions={positions}
            color={color}
            weight={project.selected ? 16 : 14}
            key={project.id}
          />
        )
    }

  }

  render () {
    console.log(this.props.hour)
    console.log(APC_AM[0])
    console.log(routes)
    // console.log(APC_DATA[0])
    // let dataSegments = {}
    // APC_DATA.map(d => {
    //   // const time = moment(d.timemin, 'h:mmA')
    //   if (!dataSegments[d.timemin]) {
    //     dataSegments[d.timemin] = []
    //   }
    //   dataSegments[d.timemin].push(d)
    // })
    // console.log(dataSegments)
    const position = [MM_CONFIG.map.start_location.lat, MM_CONFIG.map.start_location.lon]

    const style = {
      position: 'fixed',
      padding: '20px',
      top: '40px',
      bottom: '80px',
      left: '400px',
      right: '0px'
    }

    return (
      <Map center={position} id='map' style={style} zoom={13}>
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/${MM_CONFIG.map.mapbox.tileset}/tiles/{z}/{x}/{y}?access_token=${MM_CONFIG.map.mapbox.access_token}`}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <HeatmapLayer
          points={this.props.am ? APC_AM : APC_PM}
          longitudeExtractor={m => parseFloat(m.longitude) || 33}
          latitudeExtractor={m => parseFloat(m.latitude) || -87}
          intensityExtractor={m => this.props.ons ? parseFloat(m.ons) / 20 : parseFloat(m.offs) / 20}
        />
        <FeatureGroup>
        {routes.features.map(r => {
          <GeoJson
            data={r.geometry}
            // onEachFeature={}
          >
            <Popup>
              <div>{r.agency}</div>
            </Popup>
          </GeoJson>
        })}
        </FeatureGroup>
        {this.props.projects.highlighted ? this.getHighlightLayer(this.props.projects.highlighted) : null}
        {this.props.projects.all.map(project => this.getProjectLayer(project))}
      </Map>
    )
  }
}
