
function Header() {
    return(
            <>
        <header>
            <nav>
                <div className="container">
                    <img src="/public/Icon.jpg" alt="Logo"/>
                    <h1>Njay's Home</h1>
                </div>
                <ul>
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