import { Link } from 'react-router-dom'
import './header.css'

function Header() {
  return (
    <>
      <header className="header">
        <nav className="nav">
          <div className="nav-left">
            <img src="/Icon.jpg" alt="Logo" className="nav-logo"/>
            <h1 className="nav-title">Njay's Home</h1>
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/playlist">Playlist</Link></li>
            <li><Link to="/activities">Activities</Link></li>
          </ul>
        </nav>
      </header>
    </>
  )
}

export default Header