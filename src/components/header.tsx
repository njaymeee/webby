import './header.css'

function Header() {
    return(
        <>
            <header className="header">
                <nav className="nav">
                    <div className="nav-left">
                        <img src="/public/Icon.jpg" alt="Logo" className="nav-logo"/>
                        <h1 className="nav-title">Njay's Home</h1>
                    </div>
                    <ul className="nav-links">
                        <li><a href="/">Home</a></li>
                        <li><a href="/about">Playlist</a></li>
                        <li><a href="/activities">Activities</a></li>
                    </ul>
                </nav>
            </header>
        </>
    )
}

export default Header