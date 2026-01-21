import React, { useCallback, useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { getConfig } from "../config";

const SERVICE_NOW_EMBED_CORE =
  /* webpackIgnore: true */
  "https://bellsharedsandbox.service-now.com/uxasset/externals/sn_embeddable_core/index.jsdbx";

const SNEmbed = () => {
  const { isAuthenticated, isLoading, getIdTokenClaims, getAccessTokenSilently } = useAuth0();
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const decodeJwtHeader = (token) => {
    try {
      const header = token.split(".")[0];
      const padded = header.replace(/-/g, "+").replace(/_/g, "/") + "==".slice((2 - header.length * 3) & 3);
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  };

  const getTokenCallBack = useCallback(async () => {
    if (!isAuthenticated) return null;

    const config = getConfig();
    const audience = config?.audience || null;

    try {
      const opts = audience ? { audience } : undefined;
      const accessToken = await getAccessTokenSilently(opts);
      if (accessToken) {
        const header = decodeJwtHeader(accessToken);
        console.info("Using access token for ServiceNow auth, header:", header);
        if (header && (header.alg === "dir" || header.enc)) {
          console.warn("Access token is encrypted (JWE). Falling back to ID token.");
        } else {
          return accessToken;
        }
      }
    } catch (err) {
      console.warn("getAccessTokenSilently failed (will try ID token):", err?.message || err);
    }

    try {
      const claims = await getIdTokenClaims();
      const idToken = claims?.__raw || null;
      if (idToken) console.info("Falling back to ID token for ServiceNow auth");
      return idToken;
    } catch (err) {
      console.error("getIdTokenClaims failed:", err?.message || err);
      return null;
    }
  }, [isAuthenticated, getAccessTokenSilently, getIdTokenClaims]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    let listEl = null;
    let setEventsFn = null;

    async function initServiceNow() {
      setLoading(true);
      try {
        if (typeof window === "undefined") {
          throw new Error("ServiceNow embeddables must be initialized in a browser environment.");
        }

        const { init, login, getEmbeddables, setEvents } = await import(
          /* webpackIgnore: true */ SERVICE_NOW_EMBED_CORE
        );

        setEventsFn = setEvents;

        await init({
          theme: "c012213bc39b10101d590cf06e40dd32",
          baseURL: "https://bellsharedsandbox.service-now.com",
          authCallback: getTokenCallBack,
          module: "8e65be8155c636d0c4fa54f03d41b068",
        });

        // Log in to ServiceNow (uses authCallback)
        await login();

        // Request the case list embeddable
        await getEmbeddables(["sn-embedx-catalog-item-form"]);

        if (!cancelled) setInitialized(true);
      } catch (err) {
        console.error("ServiceNow init error:", err);
        if (!cancelled) setInitError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initServiceNow();

    return () => {
      cancelled = true;
      try {
        if (listEl && typeof setEventsFn === "function") {
          setEventsFn(listEl, {});
        }
      } catch (err) {
        // ignore cleanup errors
      }
    };
  }, [isAuthenticated, getTokenCallBack]);

  if (initError) return <div>Failed to load ServiceNow embeddables: {initError.message}</div>;
  if (isLoading || loading) return <Loading />;

  return (
    <div className="sn-embed-page">
      <h2>ServiceNow Web Embeddables</h2>
      
      {!initialized && <p>Initializing ServiceNow embeddables...</p>}

     <sn-embedx-catalog-item-form
	sys-id="38d0ee659c2eba148e74828912e97e86"
	confirmation-text="Request submitted successfully!"
	confirmation-sub-text="Estimated resolution in 24 hours"
	reference-number-label="Reference Number :"
	primary-button-label="View details"
	secondary-button-label="Browse services">
</sn-embedx-catalog-item-form>
      
      {initialized && <p style={{marginTop: '10px', color: 'green'}}>✓ Component loaded successfully</p>}
    </div>
  );
};

export default SNEmbed;
