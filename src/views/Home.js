import React, { Fragment, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

import Hero from "../components/Hero";
import Content from "../components/Content";

const Home = () => {
  const { isAuthenticated } = useAuth0();
  const [showBell, setShowBell] = useState(false);

  return (
    <Fragment>
      <Hero />
      <hr />
      <Content />

      <div className="text-center mt-4">
        <button
          className="btn btn-secondary mr-2"
          onClick={() => setShowBell((s) => !s)}
        >
          {showBell ? "Hide Bell Home" : "Show Bell Home"}
        </button>
        <a
          className="btn btn-link"
          href="https://bell.ca"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Bell.ca in new tab
        </a>
      </div>

      {isAuthenticated && (
        <div className="text-center mt-4">
          <Link to="/sn-embed" className="btn btn-primary">
            WEB Embeddable
          </Link>
        </div>
      )}

      {showBell && (
        <div className="bell-iframe mt-3" style={{ minHeight: 400 }}>
          <iframe
            src="https://bell.ca"
            title="Bell Home"
            style={{ width: "100%", height: "800px", border: "1px solid #ddd" }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
          <p className="text-muted small mt-2">
            If the content does not load, the site may block embedding (X-Frame-Options or CSP).
            <br />
            Use the <a href="https://bell.ca" target="_blank" rel="noopener noreferrer">Open Bell.ca in new tab</a> link above.
          </p>
        </div>
      )}
    </Fragment>
  );
};

export default Home;
