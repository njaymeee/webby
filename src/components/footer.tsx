import './footer.css'

function Footer() {
    return(
        <footer className="footer">
            <div className="footer-inner">
                <p className="footer-creator">Designed & Built by <span className="creator-name">Njay</span></p>
                <p className="footer-rights">&copy; {new Date().getFullYear()} Webby. All rights reserved.</p>
                <div className="footer-spacer" />
            </div>
        </footer>
    )
}

export default Footer