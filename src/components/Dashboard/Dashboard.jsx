import React from 'react'
// import Navbar from '../navbar/Navbar'

const Dashboard = () => {
  return (
    <div>
      <div className="dashboardContainer">
        <div className="navigation">
            <div className="logo">
                <h1>Hello World</h1>
            </div>
            <div className="searchBar">
                <input type="text" placeholder="Search for cities"/>
            </div>
            <div className="controlButtons">
                <button className='Profile'>profile</button>
                <button className='signOut'>Sign out</button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
