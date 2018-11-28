import React from 'react'
import Layout from '../components/Layout'

class NotFoundPage extends React.Component {
  render() {
    return (
      <Layout location={this.props.location}>
        <h1>Page Not Found</h1>
      </Layout>
    )
  }
}

export default NotFoundPage
